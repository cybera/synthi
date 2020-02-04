import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetViewQuery } from '../../../../queries'
import UploadFile from './UploadFile'
import { datasetProptype } from '../../../../lib/adiProptypes'

const uploadDatasetGQL = gql`
  mutation UploadDataset($uuid: String!, $file: Upload!) {
    updateDataset(uuid: $uuid, file: $file) {
      uuid
      name
      columns {
        name
      }
    }
  }
`

const DatasetUploadButton = (props) => {
  const { dataset, type } = props

  return (
    <Mutation
      mutation={uploadDatasetGQL}
      refetchQueries={[{ query: datasetViewQuery, variables: { uuid: dataset.uuid } }]}
      awaitRefetchQueries
    >
      {(uploadFileMutation, { loading }) => {
        const importing = Boolean(dataset.importTask) && dataset.importTask.state !== 'done'
        let buttonText = 'Upload'
        if (loading) {
          buttonText = `Uploading ${type}...`
        } else if (importing) {
          buttonText = `Processing ${type}...`
        }

        return (
          <UploadFile
            uploadTypes={[]}
            handleFileChange={(file) => uploadFileMutation({
              variables: { uuid: dataset.uuid, file }
            })}
            text={buttonText}
            loading={loading || importing}
          />
        )
      }}
    </Mutation>
  )
}

DatasetUploadButton.propTypes = {
  dataset: datasetProptype.isRequired,
  type: PropTypes.string
}

DatasetUploadButton.defaultProps = {
  type: 'csv'
}

export default DatasetUploadButton
