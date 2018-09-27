import mkdirp from 'mkdirp'
import shortid from 'shortid'
import fs from 'fs'
import pathlib from 'path'

import { safeQuery } from '../neo4j/connection'
import { fullDatasetPath, runTransformation } from '../lib/util'
import { pubsub, withFilter } from './pubsub'
import { sendToWorkerQueue } from '../lib/queue'
import DatasetRepository from '../domain/repositories/datasetRepository'

const uploadDir = pathlib.resolve(process.env.UPLOADS_FOLDER)

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

const processDatasetUpload = async (name, upload, context) => {
  const { stream, filename } = await upload
  const { path } = await storeFS({ stream, filename })
  let dataset

  try {
    dataset = await DatasetRepository.create(context, { name, path, computed: false })

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

// TODO: Move this to a real memcached or similar service and actually tie it to the
// current user
const visibleColumnCache = {}

const columnVisible = ({id, order}) => {
  if(!visibleColumnCache[id]) {
    visibleColumnCache[id] = { visible: order ? order < 5 : false }
  }
  return visibleColumnCache[id].visible
}

export default {
  Query: {
    dataset(_, { id, name }, context) {
      let datasets = []

      if (id != null) datasets.push(DatasetRepository.get(context, id))
      else if (name != null) datasets.push(DatasetRepository.getByName(context, name))
      else datasets = DatasetRepository.getAll(context)

      return datasets
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
    async columns(dataset) {
      return dataset.columns.map(c => ({ ...c, visible: columnVisible(c) }))
    },
    samples(dataset) {
      return dataset.samples()
    },
    rows(dataset) {
      return dataset.rows()
    }
  },
  Mutation: {
    createDataset(_, { name }, context) {
      return DatasetRepository.create(context, { name })
    },
    async deleteDataset(_, { id }, context) {
      DatasetRepository.delete(context, id)
    },
    uploadFile: (_, { file }) => processUpload(file),
    uploadDataset: (_, { name, file }, context) => processDatasetUpload(name, file, context),
    createPlot(_, { jsondef }) {
      return safeQuery(`CREATE (p:Plot { jsondef: $jsondef }) 
                        RETURN ID(p) AS id, p.jsondef AS jsondef`, 
                        { jsondef: jsondef }).then(results => results[0])
    },
    async generateDataset(_, { id }, context) {
      const dataset = await DatasetRepository.get(context, id)
      dataset.generating = true
      await DatasetRepository.save(context, dataset)
      runTransformation(dataset)
      return dataset
    },
    toggleColumnVisibility(_, { id }) {
      const isVisible = columnVisible({id})
      visibleColumnCache[id].visible = !isVisible
      return visibleColumnCache[id].visible
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
