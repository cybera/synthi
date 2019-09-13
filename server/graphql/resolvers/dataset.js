import { or, and, allow, deny } from 'graphql-shield'

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
    dataset: (_, props, { user }) => filterDatasets(props, user),
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
    deleteDataset: (_, { uuid }, { user }) => deleteDataset(uuid, user),
    importCSV: (_, { uuid, ...props }, { user }) => importCSV(uuid, props, user),
    updateDataset: (_, props, { user }) => processDatasetUpdate(props, user),
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
    dataset: or(isMember({ organizationID: 'org' }), isOwner()),
  },
  Dataset: {
    '*': isOwner(),
  },
  Mutation: {
    // TODO: check owner, but with only uuid (or change this signature to use OrganizationID)
    createDataset: allow,
    deleteDataset: isOwner(),
    importCSV: isOwner(),
    updateDataset: isOwner(),
    generateDataset: isOwner(),
    toggleColumnVisibility: isOwner(),
    saveInputTransformation: isOwner()
  }
}
