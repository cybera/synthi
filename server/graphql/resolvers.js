import { GraphQLUpload } from 'apollo-upload-server'
import mkdirp from 'mkdirp'
import shortid from 'shortid'
import fs from 'fs'

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

export default {
  Upload: GraphQLUpload,
  Query: {
    dataset(_, { id }) {
      var query = [`MATCH (n:Dataset) RETURN n.name AS name, ID(n) AS id`]
      if (id != null) {
        query = [`MATCH (n:Dataset) 
                  WHERE ID(n) = $id 
                  RETURN 
                    n.name AS name, 
                    ID(n) AS id`, { id: id }]
      }
      
      return safeQuery(...query)
    }
  },
  Dataset: {
    columns(dataset) {
      return safeQuery(`MATCH (d:Dataset)<--(c:Column)
                        WHERE ID(d) = $id
                        RETURN ID(c) AS id, c.name AS name, c.order AS order`,
                        { id: dataset.id })
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
                        WITH d, ID(d) AS id, d.name AS name
                        DETACH DELETE d
                        RETURN id, name`, 
                        { id: id }).then(results => results[0])
    },
    uploadFile: (_, { file }) => processUpload(file)
  }
}
