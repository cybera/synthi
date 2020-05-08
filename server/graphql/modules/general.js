import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import gql from 'graphql-tag'

import { Tag } from '../../domain/models'

export const resolvers = {
  // From: https://www.apollographql.com/docs/graphql-tools/scalars.html
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value) // value from the client
    },
    serialize(value) {
      // the neo4j client returns a DateTime structure that won't have getTime(),
      // but it can be passed into a Date to recreate it, and if a Date is passed
      // into a Date, we get the same value back. See documentation here on DateTime:
      // https://neo4j.com/docs/api/javascript-driver/current/class/src/v1/temporal-types.js~DateTime.html
      return (new Date(value)).getTime() // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null
    }
  }),
  Query: {
    tags: (_, { prefix }) => (prefix ? Tag.findByPrefix(prefix) : Tag.all()),
    tag: (_, { name }) => Tag.getByName(name)
  }
}

// PATCH: Handle and reject parsing errors
// 'scalar Upload' can be removed once the following pull request is accepted:
// https://github.com/apollographql/apollo-upload-server/pull/2
export const typeDefs = gql`
  scalar Date
  scalar Upload

  enum FrequencyUnit {
    days
    weeks
    months
  }

  type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Tag {
    uuid: String!
    name: String!
    system: Boolean
  }

  type Query {
    uploads: [File]
    tags(prefix: String): [Tag]
    tag(name: String!): Tag
  }

  type Mutation {
    uploadFile(file: Upload!): File!
  }

  type DatasetMessage {
    uuid: String!
    status: String!
    message: String!
  }

  type Subscription {
    datasetGenerated(uuid: String!): DatasetMessage
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`
