import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLUpload } from 'apollo-upload-server'
import mkdirp from 'mkdirp'
import shortid from 'shortid'
import fs from 'fs'

const graphql = require('graphql')
const neo4j = require('../../neo4j/connection')

const typeDefs = `
scalar Upload

type File {
  id: ID!
  path: String!
  filename: String!
  mimetype: String!
  encoding: String!
}

type Dataset {
  id: Int!
  name: String!
  file: File
}

type Query {
  dataset(id: Int): [Dataset]
  uploads: [File]
}

type Mutation {
  createDataset(name: String!): Dataset
  deleteDataset(id: Int!): Dataset
  uploadFile(file: Upload!): File!
}

schema {
  query: Query
  mutation: Mutation
}
`
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

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    dataset(_, { id }) {
      const session = neo4j.session()

      var query = [`MATCH (n:Dataset) RETURN n.name AS name, ID(n) AS id`]
      if (id) {
        query = [`MATCH (n:Dataset) 
                  WHERE ID(n) = $id 
                  RETURN 
                    n.name AS name, 
                    ID(n) AS id`, { id: id }]
      }
      
      return session.run(...query).then(result => {
        const datasets = result.records.map(record => record.toObject())
        return datasets
      }).catch(e => {
        return []
      }).then(result => {
        session.close()
        return result
      }) 
    }
  },
  Mutation: {
    createDataset(_, {name}) {
      const session = neo4j.session()

      return session.run(`CREATE (d:Dataset { name: $name }) 
                          RETURN ID(d) AS id, d.name AS name`, 
                         { name: name }).then(result => {
        return result.records.map(record => record.toObject())[0]
      }).catch(e => {
        return []
      }).then(result => {
        session.close()
        return result
      })
    },
    deleteDataset(_, {id}) {
      const session = neo4j.session()

      return session.run(`MATCH (d:Dataset)
                          WHERE ID(d) = $id
                          WITH d, ID(d) AS id, d.name AS name
                          DETACH DELETE d
                          RETURN id, name`, 
                        { id: id }).then(result => {
        return result.records.map(record => record.toObject())[0]
      }).catch(e => {
        return []
      }).then(result => {
        session.close()
        return result
      })
    },
    uploadFile: (_, { file }) => processUpload(file)
  }
}

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

module.exports = executableSchema
