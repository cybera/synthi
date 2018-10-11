import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetListQuery, datasetViewQuery } from '../queries'
import EditableTextField from '../components/EditableTextField'

const updateDatasetGQL = gql`
  mutation UpdateDataset($id: Int!, $name: String) {
    updateDataset(id: $id, name: $name) {
      id
      name
    }
  }
`

const DatasetNameEditor = (props) => {
  const { dataset } = props
  return (
    <Mutation 
      mutation={updateDatasetGQL}
      refetchQueries={[{ query: datasetViewQuery }, { query: datasetListQuery }]}>
      { updateMutation => (
        <EditableTextField 
          text={dataset.name} 
          commit={(value) => updateMutation({
            variables: { id: dataset.id, name: value }
          })} />
      )}
    </Mutation>
  )
}

export default DatasetNameEditor