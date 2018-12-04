import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetViewQuery } from '../queries'
import UploadFile from '../components/UploadFile'

const uploadDatasetGQL = gql`
  mutation UploadDataset($id: Int!, $file: Upload!) {
    updateDataset(id: $id, file: $file) {
      id
      name
      columns {
        name
      }
    }
  }
`

const DatasetUploadButton = (props) => {
  const { id } = props

  return (
    <Mutation
      mutation={uploadDatasetGQL}
      refetchQueries={[{ query: datasetViewQuery, variables: { id } }]}
      awaitRefetchQueries
      update={(cache, data) => {
        console.log("Data:", data)
      }}
    >
      {(uploadFileMutation, { loading }) => (
        <UploadFile
          handleFileChange={file => uploadFileMutation({ variables: { id, file } })}
          text="Upload"
          loading={loading}
        />
      )}
    </Mutation>
  )
}

DatasetUploadButton.propTypes = {
  id: PropTypes.number.isRequired
}

export default DatasetUploadButton
