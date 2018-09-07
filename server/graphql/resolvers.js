import { GraphQLUpload } from 'apollo-upload-server'
import mkdirp from 'mkdirp'
import shortid from 'shortid'
import fs from 'fs'
import csvParse from 'csv-parse/lib/sync'
import { exec } from 'child_process';
import path from 'path'

const graphql = require('graphql')
const neo4j = require('../neo4j/connection')

const uploadDir = process.env.UPLOADS_FOLDER
// Ensure upload directory exists
mkdirp.sync(uploadDir)

const storeFS = ({ stream, filename }) => {
  const id = shortid.generate()
  const path = `${uploadDir}/${id}-${filename}`
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        console.log(error)
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(path)
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ id, path }))
  )
}

const processUpload = async upload => {
  const { stream, filename, mimetype, encoding } = await upload
  const { id, path } = await storeFS({ stream, filename })

  //return storeDB({ id, filename, mimetype, encoding, path })
  return { id, filename, mimetype, encoding, path }
}

const safeQuery = (query, params) => {
  const session = neo4j.session()

  return session.run(query, params).then(result => {
    return result.records.map(record => record.toObject())
  }).catch(e => {
    return []
  }).then(result => {
    session.close()
    return result
  })
}

const processDatasetUpload = async (name, upload) => {
  const { stream, filename, mimetype, encoding } = await upload
  const { id, path } = await storeFS({ stream, filename })

  // This would have to be modified to only read the first few lines in case the file was
  // really large...
  const fileString = fs.readFileSync(path, "utf8")
  const csv = csvParse(fileString, { columns: true })

  var column_names = []
  if (csv && csv.length > 0) {
    column_names = Object.keys(csv[0])
  }

  const query = `
    CREATE (dataset:Dataset { name: $name })
    WITH dataset
    UNWIND $columns AS column
    MERGE (dataset)<-[:BELONGS_TO]-(:Column { name: column.name, order: column.order })
    SET dataset.path = $path
    WITH dataset
    RETURN ID(dataset) AS id, dataset.name AS name
  `

  const columns = column_names.map((column_name, index) => ({ name: column_name, order: index + 1 }))

  return safeQuery(query, { name: name, columns: columns, path: path }).then(results => results[0])
}

export default {
  Upload: GraphQLUpload,
  Query: {
    dataset(_, { id }) {
      var query = [`MATCH (n:Dataset) RETURN n.name AS name, ID(n) AS id, n.path AS path`]
      if (id != null) {
        query = [`MATCH (n:Dataset) 
                  WHERE ID(n) = $id 
                  RETURN 
                    n.name AS name, 
                    ID(n) AS id,
                    n.computed AS computed,
                    n.path AS path`, { id: id }]
      }
      
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
      if (dataset.path) {
        const fileString = fs.readFileSync(dataset.path, "utf8")
        const csv = csvParse(fileString, { columns: true })
        const jsonStrings = csv.slice(0,10).map(r => JSON.stringify(r))
        return jsonStrings
      } else { 
        return []
      }
    },
    rows(dataset) {
      if (dataset.path) {
        const fileString = fs.readFileSync(dataset.path, "utf8")
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
    uploadDataset: (_, { name, file }) => processDatasetUpload(name, file),
    createPlot(_, { jsondef }) {
      return safeQuery(`CREATE (p:Plot { jsondef: $jsondef }) 
                        RETURN ID(p) AS id, p.jsondef AS jsondef`, 
                        { jsondef: jsondef }).then(results => results[0])
    },
    generateDataset(_, { id }) {
      const transform_script = path.resolve(__dirname, '..', 'scripts', 'engine.py')
      console.log(transform_script)
      exec(transform_script, (error, stdout, stderr) => {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      })
      return safeQuery(`MATCH(d:Dataset)
                        WHERE ID(d) = $id
                        RETURN d.name AS name, 
                               ID(d) AS id,
                               d.computed AS computed,
                               d.path AS path
      `, { id: id })
      .then(results => results[0])
    }
  }
}
