export default /* GraphQL */ `
scalar Upload

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
}

type Dataset {
  id: Int!
  name: String!
  columns: [Column]
  samples: [String]
  rows: [String]
  path: String
}

type Query {
  dataset(id: Int): [Dataset]
  plots(id: Int): [Plot]
  uploads: [File]
}

type Plot {
  id: Int!
  layout: String
  data: String
}

type Mutation {
  createDataset(name: String!): Dataset
  deleteDataset(id: Int!): Dataset
  uploadFile(file: Upload!): File!
  uploadDataset(name: String!, file:Upload!): Dataset
  createPlot(data:String, layout:String): Plot
}

schema {
  query: Query
  mutation: Mutation
}
`
