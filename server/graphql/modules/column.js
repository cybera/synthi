import gql from 'graphql-tag'

import { isOwner } from '../rules'
import { updateColumn } from '../../domain/contexts/dataset'

export const resolvers = {
  Column: {
    tags: column => column.tags(),
    visible: (column, _, { user }) => column.visibleForUser(user)
  },
  Mutation: {
    updateColumn: async (_, { uuid, values, tagNames }) => (
      updateColumn(uuid, values, tagNames)
    )
  }
}

export const permissions = {
  Column: {
    '*': isOwner()
  },
  Mutation: {
    updateColumn: isOwner()
  }
}

export const typeDefs = gql`
  type Column {
    id: Int
    uuid: String!
    name: String!
    originalName: String
    order: Int
    visible: Boolean
    tags: [Tag]
  }

  input ColumnInput {
    name: String
    order: Int
  }

  extend type Dataset {
    columns: [Column]
  }

  extend type Mutation {
    toggleColumnVisibility(uuid: String!): Boolean
    updateColumn(uuid:String!, values:ColumnInput, tagNames:[String]): Column
  }
`
