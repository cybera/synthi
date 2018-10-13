import React from 'react'
import DescriptionIcon from '@material-ui/icons/Description'
import { withStyles } from '@material-ui/core/styles'

import gql from "graphql-tag"
import { Mutation } from "react-apollo"
import { compose } from '../lib/common'

import UploadFile from '../components/UploadFile'

const uploadDatasetGQL = gql`
  mutation UploadDataset($id: Int!, $file: Upload!) {
    updateDataset(id: $id, file: $file) {
      id
      name
    }
  }
`

const DatasetUploadButton = (props) => {
  const { dataset } = props
  const { id } = dataset

  return (
    <Mutation mutation={uploadDatasetGQL}>
      { uploadFileMutation => (
        <UploadFile 
          handleFileChange={file => uploadFileMutation({variables: { id, file }})} 
          text='Upload'
        />
      )}
    </Mutation>
  )
}

export default DatasetUploadButton