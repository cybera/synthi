import gql from 'graphql-tag';

export const datasetListQuery = gql`
query($searchString: String, $org: OrganizationID) {
  dataset(searchString: $searchString, org: $org) {
    id,
    name,
    owner {
      id
    }
  }
}
`

export const deleteDatasetMutation = gql`
mutation DeleteDataset($id: Int!) {
  deleteDataset(id: $id)
}
`

export const datasetViewQuery = gql`
query($id: Int) {
  dataset(id: $id) {
    id
    type
    name
    columns {
      id
      name
      order
      visible
      originalName
    }
    computed
    generating
    samples
    inputTransformation {
      id
      code
      error
      virtual
    }
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

export const datasetConnectionsQuery = gql`
  query($id: Int!) {
    dataset(id: $id) {
     id
     name
     connections
   }
 }
`


export const datasetColumnTagsQuery = gql`
  query($id: Int!) {
    dataset(id: $id) {
      columns {
        id
        uuid
        name
        tags {
          name
        }
      }
    }
  }
`

export const updateDatasetColumnsMutation = gql`
  mutation UpdateColumn($uuid: String!, $values: ColumnInput, $tagNames: [String]) {
    updateColumn(
      uuid: $uuid,
      values: $values,
      tagNames: $tagNames
    ) {
      name
    }
  }
`