import gql from "graphql-tag";

export const datasetListQuery = gql`
{
  dataset {
    id,
    name
  }
}
`

export const uploadDatasetMutation = gql`
mutation UploadDataset($name: String!, $file: Upload!) {
  uploadDataset(name: $name, file: $file) {
    id
    name
  }
}
`

export const deleteDatasetMutation = gql`
mutation DeleteDataset($id: Int!) {
  deleteDataset(id: $id) {
    id
    name
  }
}
`

export const datasetViewQuery = gql`
query($id: Int) {
  dataset(id: $id) {
    id
    name
    columns {
      id
      name
      order
    }
    samples
  }
}
`

export const plotsRetrieveQuery = gql`
{
  plots {
    id
    jsondef
  }
}
`