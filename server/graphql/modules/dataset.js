import { or, and, allow, deny } from 'graphql-shield'
import gql from 'graphql-tag'

import { pubsub, withFilter } from '../pubsub'
import { isOwner, isMember, isPublished, memberCanCreateDatasets } from '../rules'

import { updateDatasetMetadata } from '../../domain/contexts/dataset'
import { TOPICS } from '../../domain/models/dataset'

import {
  processDatasetUpdate,
  filterDatasets,
  createDataset,
  deleteDataset,
  importCSV,
  generateDataset,
  toggleColumnVisibility,
  saveInputTransformation,
  listDatasets,
  setPublished,
  createComputedDatasetFromTransformation,
  uniqueDefaultDatasetName,
  SUPPORTED_FORMATS,
} from '../../domain/contexts/dataset'

const DATASET_UPDATED = 'DATASET_UPDATED'

export const resolvers = {
  Query: {
    dataset: (_, props, context) => filterDatasets(context, props),
    listDatasets: (_, { org, filter, offset, limit }, context) => listDatasets(context, org, filter, offset, limit),
    uniqueDefaultDatasetName: (_, { org }) => uniqueDefaultDatasetName(org),
    topics: () => TOPICS,
    supportedFormats: () => SUPPORTED_FORMATS,
  },
  Dataset: {
    columns: dataset => dataset.columns(),
    samples: dataset => dataset.samples(),
    rows: dataset => dataset.rows(),
    owner: dataset => dataset.owner(),
    inputTransformation: dataset => dataset.inputTransformation(),
    connections: dataset => dataset.connections(),
    canPublish: (dataset, _, { user }) => dataset.canPublish(user),
    lastTask: (dataset, { types }) => dataset.lastTask(types),
  },
  Mutation: {
    createDataset: (_, { name, owner, type }) => (
      createDataset({ uuid: owner }, name, type)
    ),
    deleteDataset: (_, { uuid }) => deleteDataset(uuid),
    importCSV: (_, { uuid, ...props }) => importCSV(uuid, props),
    updateDataset: (_, { uuid, ...props }) => processDatasetUpdate(uuid, props),
    generateDataset: (_, { uuid }, { user }) => generateDataset(uuid, user),
    toggleColumnVisibility: (_, { uuid }, { user }) => toggleColumnVisibility(uuid, user),
    saveInputTransformation: (_, { uuid, ...props }, { user }) => (
      saveInputTransformation(uuid, props, user)
    ),
    createComputedDatasetFromTransformation: (_, { params, owner }) => (
      createComputedDatasetFromTransformation(params, owner)
    ),
    publishDataset: (_, { uuid, published }) => setPublished(uuid, published),
    updateDatasetMetadata: async (_, { uuid, metadata }, context) => (
      updateDatasetMetadata(uuid, metadata)
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
    listDatasets: isMember({organizationRef: 'org'}),
    uniqueDefaultDatasetName: isMember({organizationRef: 'org'}),
  },
  Dataset: {
    '*': or(isOwner(), isPublished()),
  },
  Mutation: {
    createDataset: and(
      isMember({ organizationUUID: 'owner' }),
      memberCanCreateDatasets({ organizationUUID: 'owner' })
    ),
    deleteDataset: isOwner(),
    importCSV: isOwner(),
    updateDataset: isOwner(),
    generateDataset: isOwner(),
    toggleColumnVisibility: isOwner(),
    saveInputTransformation: isOwner(),
    publishDataset: isOwner(),
    createComputedDatasetFromTransformation: isMember({ organizationRef: 'owner' }),
    updateDatasetMetadata: isOwner()
  }
}

export const typeDefs = gql`
  enum DatasetType {
    csv
    document
    other
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

  type DownloadFormat {
    variant: String,
    format: String,
    filename: String,
    uri: String
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
    published: Boolean
    canPublish: Boolean
    ownerName: String
    bytes: Int
    lastTask(types: [String]): Task
    title: String
    dateAdded: Date
    dateCreated: Date
    dateUpdated: Date
    format: String
    downloadOptions: [DownloadFormat]
    description: String
    ext_contributor: String
    ext_contact: String
    ext_updates: Boolean
    ext_updateFrequencyAmount: Int
    ext_updateFrequencyUnit: FrequencyUnit
    ext_source: String
    ext_identifier: String
    ext_topic: [String]
  }

  input DatasetMetadataInput {
    title: String
    dateAdded: Date
    dateCreated: Date
    dateUpdated: Date
    format: String
    description: String
    ext_contributor: String
    ext_contact: String
    ext_updates: Boolean
    ext_updateFrequencyAmount: Int
    ext_updateFrequencyUnit: FrequencyUnit
    ext_source: String
    ext_identifier: String
    ext_topic: [String]
  }

  enum FileSizeUnit {
    kb
    mb
    gb
  }

  input FileSizeRange {
    min: Int
    max: Int
    unit: FileSizeUnit
  }

  input DatasetFilter {
    publishedOnly: Boolean
    includeShared: Boolean
    format: String
    sizeRange: FileSizeRange
    topics: [String]
    searchString: String
  }

  type ListDatasetsResult {
    datasets: [Dataset]
    last: Boolean
  }

  extend type Query {
    dataset(uuid: String, name: String, searchString: String, org:OrganizationRef): [Dataset]!
    listDatasets(org: OrganizationRef!, filter: DatasetFilter = {
      publishedOnly: false,
      includeShared: true,
      format: null
    }, offset: Int = 0, limit: Int = 10): ListDatasetsResult
    uniqueDefaultDatasetName(org: OrganizationRef!): String!
    topics: [String]
    supportedFormats: [String]
  }

  input ComputedDatasetFromTransformationParams {
    name: String
    inputs: [TransformationInputMapping]
    template: TemplateRef
  }

  type CreateComputedDatasetResult {
    dataset: Dataset
    error: String
  }

  extend type Mutation {
    createDataset(name: String, owner: String, type: DatasetType = csv): Dataset
    deleteDataset(uuid: String!): Boolean
    importCSV(uuid: String!, removeExisting: Boolean = false, options: CSVImportOptions): Dataset
    uploadDataset(name: String!, file:Upload!): Dataset
    updateDataset(uuid: String!, file:Upload, computed:Boolean, name:String, generating:Boolean): Dataset
    generateDataset(uuid: String!): Dataset
    publishDataset(uuid: String!, published: Boolean): Transformation
    createComputedDatasetFromTransformation(
      params: ComputedDatasetFromTransformationParams,
      owner: OrganizationRef
    ): CreateComputedDatasetResult!
    updateDatasetMetadata(uuid: String!, metadata:DatasetMetadataInput): Dataset
  }
`
