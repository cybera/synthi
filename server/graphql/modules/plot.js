import gql from 'graphql-tag'
import { filterPlots, createPlot } from '../../domain/contexts/plot'

export const resolvers = {
  Query: {
    plots: (_, { uuid }) => filterPlots({ uuid })
  },
  Mutation: {
    createPlot: (_, { jsondef }) => createPlot(jsondef)
  }
}

export const typeDefs = gql`
  type Plot {
    id: Int
    uuid: String!
    jsondef: String!
  }

  extend type Query {
    plots(uuid: String): [Plot]
  }
  
  extend type Mutation {
    createPlot(jsondef:String!): Plot
  }
`
