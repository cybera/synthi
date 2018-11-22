import React from 'react'

import ADIButton from '../ADIButton'

const handleDownload = (url) => {
  window.location.replace(url)
}

const DownloadButton = (props) => {
  const { dataset } = props

  const url = `${window.location.origin}/dataset/${dataset.id}`

  return (
    <ADIButton onClick={() => handleDownload(url)}>Download</ADIButton>
  )
}

export default DownloadButton
