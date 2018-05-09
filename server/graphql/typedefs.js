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
  file: File
}

type Query {
  dataset(id: Int): [Dataset]
  uploads: [File]
}

type Mutation {
  createDataset(name: String!): Dataset
  deleteDataset(id: Int!): Dataset
  uploadFile(file: Upload!): File!
}

schema {
  query: Query
  mutation: Mutation
}
`
