import React from 'react'

import Button from '@material-ui/core/Button'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'

const handleDownload = (url) => {
  window.location.replace(url)
}

const DownloadButton = (props) => {
  const { dataset } = props

  const url = `${window.location.origin}/dataset/${dataset.id}`

  return (
    <Button variant="contained" color="secondary" onClick={() => handleDownload(url)}>
      <CloudDownloadIcon style={{ marginRight: 10 }} />
      Download
      {' '}
      {dataset.type}
    </Button>
  )
}

export default DownloadButton
