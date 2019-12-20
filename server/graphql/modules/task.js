import gql from 'graphql-tag'

export const resolvers = {
}

export const permissions = {
}

export const typeDefs = gql`
  type Task {
    id: Int
    uuid: String!
    state: String!
    dateUpdated: Date
    type: String
  }
`
