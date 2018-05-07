const graphql = require('graphql')
const neo4j = require('../../neo4j/connection')

// define the Dataset type for graphql
const DatasetType = new graphql.GraphQLObjectType({
  name: 'dataset',
  description: 'a dataset item',
  fields: {
    id: {type: graphql.GraphQLInt},
    name: {type: graphql.GraphQLString}
  }
})

// define the queries of the graphql Schema
const query = new graphql.GraphQLObjectType({
  name: 'DatasetQuery',
  fields: {
    dataset: {
      type: new graphql.GraphQLList(DatasetType),
      args: {
        id: {
          type: graphql.GraphQLInt
        }
      },
      resolve: (_, {id}) => {
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
    }
  }
})

// define the mutations of the graphql Schema
const mutation = new graphql.GraphQLObjectType({
  name: 'DatasetMutation',
  fields: {
    createDataset: {
      type: new graphql.GraphQLList(DatasetType),
      args: {
        name: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {name}) => {
        const session = neo4j.session()

        return session.run(`CREATE (d:Dataset { name: $name }) 
                            RETURN ID(d) AS id, d.name AS name`, 
                           { name: name }).then(result => {
          return result.records.map(record => record.toObject())
        }).catch(e => {
          return []
        }).then(result => {
          session.close()
          return result
        })
      }
    },
    deleteDataset: {
      type: new graphql.GraphQLList(DatasetType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, {id}) => {
        const session = neo4j.session()

        return session.run(`MATCH (d:Dataset)
                            WHERE ID(d) = $id
                            WITH d, ID(d) AS id, d.name AS name
                            DETACH DELETE d
                            RETURN id, name`, 
                           { id: id }).then(result => {
          return result.records.map(record => record.toObject())
        }).catch(e => {
          return []
        }).then(result => {
          session.close()
          return result
        })
      }
    }
  }
})

// creates and exports the GraphQL Schema
module.exports = new graphql.GraphQLSchema({
  query,
  mutation
})

