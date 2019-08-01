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
  const { id, type } = props

  let uploadTypes = []
  if (type === 'csv') {
    uploadTypes = ['.csv']
  } else if (type === 'document') {
    uploadTypes = ['.pdf', '.txt', '.doc', '.docx']
  }

  return (
    <Mutation
      mutation={uploadDatasetGQL}
      refetchQueries={[{ query: datasetViewQuery, variables: { id } }]}
      awaitRefetchQueries
    >
      {(uploadFileMutation, { loading }) => (
        <UploadFile
          uploadTypes={uploadTypes}
          handleFileChange={file => uploadFileMutation({ variables: { id, file } })}
          text={`Upload ${type}`}
          loading={loading}
        />
      )}
    </Mutation>
  )
}

DatasetUploadButton.propTypes = {
  id: PropTypes.number.isRequired,
  type: PropTypes.string
}

DatasetUploadButton.defaultProps = {
  type: 'csv'
}

export default DatasetUploadButton
