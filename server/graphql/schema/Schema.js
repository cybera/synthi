const { makeExecutableSchema } = require('graphql-tools')

const graphql = require('graphql')
const neo4j = require('../../neo4j/connection')

const typeDefs = `
type Dataset {
  id: Int!
  name: String!
}

type Query {
  dataset(id: Int): [Dataset]
}

type Mutation {
  createDataset(name: String!): Dataset
  deleteDataset(id: Int!): Dataset
}

schema {
  query: Query
  mutation: Mutation
}
`

const resolvers = {
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
    }
  }
}

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

module.exports = executableSchema
