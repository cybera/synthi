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
  theme: String
`

export default /* GraphQL */ `

scalar Date

enum DatasetFormat {
  csv
}
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

type Column {
  id: Int!
  name: String!
  order: Int
  visible: Boolean
}

type DatasetMetadata {
  ${DatasetMetadata}
}

input DatasetMetadataInput {
  ${DatasetMetadata}
}

type Dataset {
  id: Int!
  name: String!
  owner: Organization!
  columns: [Column]
  samples: [String]
  rows: [String]
  path: String
  computed: Boolean
  generating: Boolean
  inputTransformation: Transformation
  metadata: DatasetMetadata
  connections: String
}


type Transformation {
  id: Int!
  name: String
  script: String
  inputs: [Dataset]
  outputs: [Dataset]
  code: String
}

type Plot {
  id: Int!
  jsondef: String!
}

type Query {
  dataset(id: Int, name: String, searchString: String): [Dataset]
  plots(id: Int): [Plot]
  uploads: [File]
  currentUser: User
}

type Organization {
  id: Int!
  name: String!
  members: [User]
}

type User {
  id: Int!
  username: String!
  organizations: [Organization]
  apikey: String
}

type Mutation {
  createDataset(name: String, owner: Int): Dataset
  deleteDataset(id: Int!): Dataset
  uploadFile(file: Upload!): File!
  uploadDataset(name: String!, file:Upload!): Dataset
  updateDataset(id: Int!, file:Upload, computed:Boolean, name:String): Dataset
  createPlot(jsondef:String!): Plot
  generateDataset(id: Int!): Dataset
  toggleColumnVisibility(id: Int!): Boolean
  saveInputTransformation(id: Int!, code:String): Transformation
  updateDatasetMetadata(id: Int!, metadata:DatasetMetadataInput): DatasetMetadata
  regenerateAPIKey: User
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
