import gql from 'graphql-tag';

export const datasetListQuery = gql`
query($searchString: String, $org: OrganizationID) {
  dataset(searchString: $searchString, org: $org) {
    id
    uuid
    name
    owner {
      id
      uuid
    }
  }
}
`

export const deleteDatasetMutation = gql`
mutation DeleteDataset($uuid: String!) {
  deleteDataset(uuid: $uuid)
}
`

export const datasetViewQuery = gql`
query($uuid: String) {
  dataset(uuid: $uuid) {
    id
    uuid
    type
    name
    columns {
      id
      uuid
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
      uuid
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
    uuid
    jsondef
  }
}
`

export const datasetConnectionsQuery = gql`
  query($uuid: String!) {
    dataset(uuid: $uuid) {
     id
     uuid
     name
     connections
   }
 }
`


export const datasetColumnTagsQuery = gql`
  query($uuid: String!) {
    dataset(uuid: $uuid) {
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