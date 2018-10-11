export default /* GraphQL */ `

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

type Dataset {
  id: Int!
  name: String!
  columns: [Column]
  samples: [String]
  rows: [String]
  path: String
  computed: Boolean
  generating: Boolean
  inputTransformation: Transformation
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
  dataset(id: Int, name: String): [Dataset]
  plots(id: Int): [Plot]
  uploads: [File]
}

type Mutation {
  createDataset(name: String): Dataset
  deleteDataset(id: Int!): Dataset
  uploadFile(file: Upload!): File!
  uploadDataset(name: String!, file:Upload!): Dataset
  updateDataset(id: Int!, file:Upload, computed:Boolean): Dataset
  createPlot(jsondef:String!): Plot
  generateDataset(id: Int!): Dataset
  toggleColumnVisibility(id: Int!): Boolean
  saveInputTransformation(id: Int!, code:String): Transformation
}

type Subscription {
  datasetGenerated(id: Int!): Dataset
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`
