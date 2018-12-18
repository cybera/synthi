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

directive @authCanAccess on OBJECT | FIELD_DEFINITION

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
  id: Int!
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

input OrganizationID {
  id: Int
  uuid: String
  name: String
}

type DatasetStoragePaths {
  original: String,
  imported: String,
  sample: String
}

type Dataset @authCanAccess {
  id: Int!
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

type Transformation @authCanAccess {
  id: Int!
  uuid: String!
  name: String
  script: String
  inputs: [Dataset]
  outputs: [Dataset]
  code: String
  error: String
}

type Plot {
  id: Int!
  jsondef: String!
}

type Query {
  dataset(id: Int, name: String, searchString: String, org:OrganizationID): [Dataset]!
  plots(id: Int): [Plot]
  uploads: [File]
  currentUser: User
}

type Organization @authCanAccess {
  id: Int!
  uuid: String!
  name: String!
  members: [User]
}

type User {
  id: Int!
  uuid: String!
  username: String!
  organizations: [Organization]
  apikey: String @authCanAccess
}

input CSVImportOptions {
  header: Boolean,
  delimiter: String,
  customDelimiter: String
}

type Mutation {
  createDataset(name: String, owner: Int): Dataset
  deleteDataset(id: Int!): Dataset
  importCSV(id: Int!, removeExisting: Boolean = false, options: CSVImportOptions): Dataset
  uploadFile(file: Upload!): File!
  uploadDataset(name: String!, file:Upload!): Dataset
  updateDataset(id: Int!, file:Upload, computed:Boolean, name:String, generating:Boolean): Dataset
  createPlot(jsondef:String!): Plot
  generateDataset(id: Int!): Dataset
  toggleColumnVisibility(id: Int!): Boolean
  saveInputTransformation(id: Int!, code:String): Transformation
  updateDatasetMetadata(id: Int!, metadata:DatasetMetadataInput): DatasetMetadata
  regenerateAPIKey: User
  updateColumn(uuid:String!, values:ColumnInput, tagNames:[String]): Column
}

type Subscription {
  datasetGenerated(id: Int!): DatasetMessage
}

type DatasetMessage {
  id: Int!
  status: String!
  message: String!
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`
