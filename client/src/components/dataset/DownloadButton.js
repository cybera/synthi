import React from 'react'

import ADIButton from '../ADIButton'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'

const handleDownload = (url) => {
  window.location.replace(url)
}

const DownloadButton = (props) => {
  const { dataset } = props

  const url = `${window.location.origin}/dataset/${dataset.id}`

  return (
    <ADIButton onClick={() => handleDownload(url)}>
      <CloudDownloadIcon style={{ marginRight: 10, fontSize: '1.45em' }} />
      Download
    </ADIButton>
  )
}

export default DownloadButton
