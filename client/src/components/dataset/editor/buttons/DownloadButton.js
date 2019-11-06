import React from 'react'

import Button from '@material-ui/core/Button'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import { datasetProptype } from '../../../../lib/adiProptypes'

const handleDownload = (url) => {
  window.location.replace(url)
}

const DownloadButton = (props) => {
  const { dataset, ...rest } = props

  const url = `${window.location.origin}/dataset/${dataset.uuid}`

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Button {...rest} variant="contained" color="secondary" onClick={() => handleDownload(url)}>
      <CloudDownloadIcon style={{ marginRight: 10 }} />
      Download
      {' '}
      {dataset.type}
    </Button>
  )
}

DownloadButton.propTypes = {
  dataset: datasetProptype.isRequired
}

export default DownloadButton
