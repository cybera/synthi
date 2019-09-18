import gql from 'graphql-tag'

import { isOwner } from '../rules'
import { updateDatasetMetadata } from '../../domain/contexts/dataset'

export const resolvers = {
  Dataset: {
    metadata: async dataset => await dataset.metadata() || {}
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    updateDatasetMetadata: async (_, { uuid, metadata }, context) => (
      updateDatasetMetadata(uuid, metadata)
    )
  }
}

export const permissions = {
  Dataset: {
    metadata: isOwner()
  },
  Mutation: {
    updateDatasetMetadata: isOwner()
  }
}

export const DatasetMetadata = `
  title: String
  contributor: String
  contact: String
  dateAdded: Date
  dateCreated: Date
  dateUpdated: Date
  updates: Boolean
  updateFrequencyAmount: Int
  updateFrequencyUnit: FrequencyUnit
  format: DatasetFormat
  description: String
  source: String
  identifier: String
  topic: [String]
`

export const typeDefs = gql`
  type DatasetMetadata {
    uuid: String!
    ${DatasetMetadata}
  }

  input DatasetMetadataInput {
    ${DatasetMetadata}
  }

  extend type Dataset {
    metadata: DatasetMetadata
  }

  extend type Mutation {
    updateDatasetMetadata(uuid: String!, metadata:DatasetMetadataInput): DatasetMetadata
  }
`
