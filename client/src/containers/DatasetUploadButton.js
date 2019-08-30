import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetViewQuery } from '../queries'
import UploadFile from '../components/UploadFile'

const uploadDatasetGQL = gql`
  mutation UploadDataset($uuid: String!, $file: Upload!) {
    updateDataset(uuid: $uuid, file: $file) {
      id
      uuid
      name
      columns {
        name
      }
    }
  }
`

const DatasetUploadButton = (props) => {
  const { uuid, type } = props

  let uploadTypes = []
  if (type === 'csv') {
    uploadTypes = ['.csv']
  } else if (type === 'document') {
    uploadTypes = ['.pdf', '.txt', '.doc', '.docx']
  }

  return (
    <Mutation
      mutation={uploadDatasetGQL}
      refetchQueries={[{ query: datasetViewQuery, variables: { uuid } }]}
      awaitRefetchQueries
    >
      {(uploadFileMutation, { loading }) => (
        <UploadFile
          uploadTypes={uploadTypes}
          handleFileChange={file => uploadFileMutation({ variables: { uuid, file } })}
          text={`Upload ${type}`}
          loading={loading}
        />
      )}
    </Mutation>
  )
}

DatasetUploadButton.propTypes = {
  uuid: PropTypes.string.isRequired,
  type: PropTypes.string
}

DatasetUploadButton.defaultProps = {
  type: 'csv'
}

export default DatasetUploadButton
