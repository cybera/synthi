import { or, and, allow, deny } from 'graphql-shield'
import gql from 'graphql-tag'

import { pubsub, withFilter } from '../pubsub'
import { isOwner, isMember } from '../rules'

import {
  processDatasetUpdate,
  filterDatasets,
  createDataset,
  deleteDataset,
  importCSV,
  generateDataset,
  toggleColumnVisibility,
  saveInputTransformation
} from '../../domain/contexts/dataset'

const DATASET_UPDATED = 'DATASET_UPDATED'

export const resolvers = {
  Query: {
    dataset: (_, props) => filterDatasets(props),
  },
  Dataset: {
    columns: dataset => dataset.columns(),
    samples: dataset => dataset.samples(),
    rows: dataset => dataset.rows(),
    owner: dataset => dataset.owner(),
    inputTransformation: dataset => dataset.inputTransformation(),
    connections: dataset => dataset.connections()
  },
  Mutation: {
    createDataset: (_, { name, owner, type }, { user }) => (
      createDataset(owner, name, type, user)
    ),
    deleteDataset: (_, { uuid }) => deleteDataset(uuid),
    importCSV: (_, { uuid, ...props }) => importCSV(uuid, props),
    updateDataset: (_, { uuid, ...props }) => processDatasetUpdate(uuid, props),
    generateDataset: (_, { uuid }, { user }) => generateDataset(uuid, user),
    toggleColumnVisibility: (_, { uuid }, { user }) => toggleColumnVisibility(uuid, user),
    saveInputTransformation: (_, { uuid, ...props }, { user }) => (
      saveInputTransformation(uuid, props, user)
    )
  },
  Subscription: {
    datasetGenerated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([DATASET_UPDATED]),
        ({ datasetGenerated }, variables) => datasetGenerated.uuid === variables.uuid
      )
    },
  }
}

export const permissions = {
  Query: {
    dataset: or(isMember({ organizationRef: 'org' }), isOwner()),
  },
  Dataset: {
    '*': isOwner(),
  },
  Mutation: {
    createDataset: isMember({ organizationUUID: 'owner' }),
    deleteDataset: isOwner(),
    importCSV: isOwner(),
    updateDataset: isOwner(),
    generateDataset: isOwner(),
    toggleColumnVisibility: isOwner(),
    saveInputTransformation: isOwner()
  }
}

export const typeDefs = gql`
  enum DatasetType {
    csv
    document
  }

  enum DatasetFormat {
    csv
  }

  input CSVImportOptions {
    header: Boolean,
    delimiter: String,
    customDelimiter: String
  }

  type DatasetStoragePaths {
    original: String,
    imported: String,
    sample: String
  }

  input DatasetRef {
    name: String,
    uuid: String,
    id: Int
  }

  type Dataset {
    id: Int
    type: DatasetType!
    uuid: String!
    name: String!
    samples: [String]
    rows: [String]
    path: String @deprecated
    paths: DatasetStoragePaths
    computed: Boolean
    generating: Boolean
    connections: String
  }

  extend type Query {
    dataset(uuid: String, name: String, searchString: String, org:OrganizationRef): [Dataset]!
  }

  extend type Mutation {
    createDataset(name: String, owner: String, type: DatasetType = csv): Dataset
    deleteDataset(uuid: String!): Boolean
    importCSV(uuid: String!, removeExisting: Boolean = false, options: CSVImportOptions): Dataset
    uploadDataset(name: String!, file:Upload!): Dataset
    updateDataset(uuid: String!, file:Upload, computed:Boolean, name:String, generating:Boolean): Dataset
    generateDataset(uuid: String!): Dataset
  }
`
