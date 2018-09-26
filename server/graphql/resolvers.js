import mkdirp from 'mkdirp'
import shortid from 'shortid'
import fs from 'fs'
import csvParse from 'csv-parse/lib/sync'
import pathlib from 'path'

import neo4j, { safeQuery } from '../neo4j/connection'
import { runTransformation, waitForFile } from '../lib/util'
import DatasetRepository from '../model/datasetRepository'

import { fullDatasetPath } from '../lib/util'

const graphql = require('graphql')

const uploadDir = pathlib.resolve(process.env.UPLOADS_FOLDER)

import { pubsub, withFilter } from './pubsub'
import { sendToWorkerQueue } from '../lib/queue'

const DATASET_UPDATED = 'DATASET_UPDATED';

// Ensure upload directory exists
mkdirp.sync(uploadDir)

const storeFS = ({ stream, filename }) => {
  const id = shortid.generate()
  const uniqueFilename = `${id}-${filename}`
  const fullPath = fullDatasetPath(uniqueFilename)

  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        console.log(error)
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(fullPath)
        reject(error)
      })
      .pipe(fs.createWriteStream(fullPath))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ id, path: uniqueFilename }))
  )
}

const processUpload = async upload => {
  const { stream, filename, mimetype, encoding } = await upload
  const { id, path } = await storeFS({ stream, filename })

  //return storeDB({ id, filename, mimetype, encoding, path })
  return { id, filename, mimetype, encoding, path }
}

const processDatasetUpload = async (name, upload, owner) => {
  const { stream, filename } = await upload
  const { path } = await storeFS({ stream, filename })
  let dataset

  try {
    dataset = await DatasetRepository.create({ name, path, owner, 'computed': false })

    sendToWorkerQueue({
      task: 'import_csv',
      id: dataset.id
    })
  } catch (e) {
    // TODO: What should we do here?
    console.log(e.message)
  }

  return dataset
}

export default {
  Query: {
    dataset(_, { id, name }) {
      let conditions = []
      if (id != null) { conditions.push("ID(n) = $id") }
      if (name != null) { conditions.push("n.name = $name") }
      let conditionString = conditions.join(" AND ")
      if (conditions.length > 0) { conditionString = `WHERE ${conditionString}` }

      var query = [`MATCH (n:Dataset) 
                    ${conditionString} 
                    RETURN n.name AS name, 
                           ID(n) AS id, 
                           n.computed as computed, 
                           COALESCE(n.generating, false) AS generating,
                           n.path AS path`, { id: id, name: name }]

      return safeQuery(...query)
    },
    plots(_, { id }) {
      console.log("plots: ")
      var query = [`MATCH (p:Plot) RETURN p.jsondef AS jsondef, ID(p) as id`]
      if (id != null) {
        query = [`MATCH (p:Plot) 
                  WHERE ID(p) = $id 
                  RETURN 
                    p.jsondef AS jsondef, 
                    ID(p) AS id`, { id: id }]
      }
      return safeQuery(...query)
    }
  },
  Dataset: {
    columns(dataset) {
      return safeQuery(`MATCH (d:Dataset)<--(c:Column)
                        WHERE ID(d) = $id
                        RETURN ID(c) AS id, c.name AS name, c.order AS order
                        ORDER BY order`,
                        { id: dataset.id })
    },
    samples(dataset) {
      const path = fullDatasetPath(dataset.path)

      if (dataset.path && fs.existsSync(path)) {
        const fileString = fs.readFileSync(path, "utf8")
        const csv = csvParse(fileString, { columns: true })
        const jsonStrings = csv.slice(0,10).map(r => JSON.stringify(r))
        return jsonStrings
      } else { 
        return []
      }
    },
    rows(dataset) {
      if (dataset.path) {
        const path = fullDatasetPath(dataset.path)
        const fileString = fs.readFileSync(path, "utf8")
        const csv = csvParse(fileString, { columns: true })
        const jsonStrings = csv.map(r => JSON.stringify(r))
        return jsonStrings
      } else { 
        return []
      }
    }
  },
  Mutation: {
    createDataset(_, {name}) {
      return safeQuery(`CREATE (d:Dataset { name: $name }) 
                        RETURN ID(d) AS id, d.name AS name`, 
                        { name: name }).then(results => results[0])
    },
    deleteDataset(_, {id}) {
      return safeQuery(`MATCH (d:Dataset)
                        WHERE ID(d) = $id
                        OPTIONAL MATCH (d)<--(c:Column)
                        WITH d, d.name AS name, ID(d) AS id, d.path as path, c
                        DETACH DELETE d,c
                        RETURN name, id, path
                        LIMIT 1`, 
                        { id: id })
                        .then(results => results[0])
                        .then(result => {
                          fs.unlinkSync(result.path)
                          return result
                        })
    },
    uploadFile: (_, { file }) => processUpload(file),
    uploadDataset: (_, { name, file }, context) => processDatasetUpload(name, file, context.user),
    createPlot(_, { jsondef }) {
      return safeQuery(`CREATE (p:Plot { jsondef: $jsondef }) 
                        RETURN ID(p) AS id, p.jsondef AS jsondef`, 
                        { jsondef: jsondef }).then(results => results[0])
    },
    async generateDataset(_, { id }) {
      let dataset = await safeQuery(`MATCH(d:Dataset)
                                     WHERE ID(d) = $id
                                     SET d.generating = true
                                     RETURN d.name AS name, 
                                            ID(d) AS id,
                                            COALESCE(d.generating, false) AS generating,
                                            d.computed AS computed,
                                            d.path AS path
                                    `, { id: id })
                            .then(results => results[0])

      runTransformation(dataset)

      return dataset
    }
  },
  Subscription: {
    datasetGenerated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([DATASET_UPDATED]),
        (payload, variables) => {
          return payload.datasetGenerated.id === variables.id
        }
      )
    },
  }
}
