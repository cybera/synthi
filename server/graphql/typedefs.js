const DatasetMetadata = `
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

// PATCH: Handle and reject parsing errors
// 'scalar Upload' can be removed once the following pull request is accepted:
// https://github.com/apollographql/apollo-upload-server/pull/2
export default /* GraphQL */ `

scalar Date
scalar Upload

enum DatasetFormat {
  csv
}
enum FrequencyUnit {
  days
  weeks
  months
}

enum DatasetType {
  csv
  document
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

type DatasetMetadata {
  uuid: String!
  ${DatasetMetadata}
}

input DatasetMetadataInput {
  ${DatasetMetadata}
}

input OrganizationRef {
  id: Int
  uuid: String
  name: String
}

type DatasetStoragePaths {
  original: String,
  imported: String,
  sample: String
}

type Dataset {
  id: Int
  type: DatasetType!
  uuid: String!
  name: String!
  owner: Organization!
  columns: [Column]
  samples: [String]
  rows: [String]
  path: String @deprecated
  paths: DatasetStoragePaths
  computed: Boolean
  generating: Boolean
  inputTransformation: Transformation
  metadata: DatasetMetadata
  connections: String
}

type Transformation {
  id: Int
  uuid: String!
  name: String
  script: String
  inputs: [Dataset]
  outputs: [Dataset]
  code: String
  error: String
  virtual: Boolean
}

type Plot {
  id: Int
  uuid: String!
  jsondef: String!
}

type Query {
  dataset(uuid: String, name: String, searchString: String, org:OrganizationRef): [Dataset]!
  plots(uuid: String): [Plot]
  uploads: [File]
  currentUser: User
}

type Organization {
  id: Int
  uuid: String!
  name: String!
  members: [User]
}

type User {
  id: Int
  uuid: String!
  username: String!
  organizations: [Organization]
  apikey: String
}

input CSVImportOptions {
  header: Boolean,
  delimiter: String,
  customDelimiter: String
}

input TemplateRef {
  name: String,
  uuid: String,
  id: Int
}

input DatasetRef {
  name: String,
  uuid: String,
  id: Int
}

input TransformationInputMapping {
  alias: String!,
  dataset: DatasetRef!
}

type Mutation {
  createDataset(name: String, owner: String, type: DatasetType = csv): Dataset
  deleteDataset(uuid: String!): Boolean
  importCSV(uuid: String!, removeExisting: Boolean = false, options: CSVImportOptions): Dataset
  uploadFile(file: Upload!): File!
  uploadDataset(name: String!, file:Upload!): Dataset
  updateDataset(uuid: String!, file:Upload, computed:Boolean, name:String, generating:Boolean): Dataset
  createPlot(jsondef:String!): Plot
  generateDataset(uuid: String!): Dataset
  toggleColumnVisibility(uuid: String!): Boolean
  saveInputTransformation(uuid: String!, code:String, template:TemplateRef, inputs:[TransformationInputMapping], org:OrganizationRef): Transformation
  updateDatasetMetadata(uuid: String!, metadata:DatasetMetadataInput): DatasetMetadata
  regenerateAPIKey: User
  updateColumn(uuid:String!, values:ColumnInput, tagNames:[String]): Column
  createTransformationTemplate(name:String!, inputs:[String], code:String, owner:OrganizationRef!): Transformation
}

type Subscription {
  datasetGenerated(uuid: String!): DatasetMessage
}

type DatasetMessage {
  uuid: String!
  status: String!
  message: String!
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`
