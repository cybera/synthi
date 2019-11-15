import gql from 'graphql-tag'
import { or } from 'graphql-shield'

import { isOwner, isPublished } from '../rules'
import { updateDatasetMetadata } from '../../domain/contexts/dataset'
import { TOPICS } from '../../domain/models/dataset-metadata'

export const resolvers = {
  Dataset: {
    metadata: async dataset => await dataset.metadata() || {}
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    updateDatasetMetadata: async (_, { uuid, metadata }, context) => (
      updateDatasetMetadata(uuid, metadata)
    )
  },
  Query: {
    topics: () => TOPICS
  }
}

export const permissions = {
  Dataset: {
    metadata: or(isOwner(), isPublished()),
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
  format: String
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

  extend type Query {
    topics: [String]
  }
`
