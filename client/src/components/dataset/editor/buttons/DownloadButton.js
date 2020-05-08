/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import SplitButton from '../../../layout/buttons/SplitButton'
import { datasetProptype } from '../../../../lib/adiProptypes'

const SingleDownloadButton = ({ dataset, fullText, ...rest }) => {
  const { downloadOptions } = dataset
  const option = downloadOptions[0]

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Button {...rest} variant="contained" color="secondary" href={option.uri} download={option.filename}>
      <CloudDownloadIcon style={{ marginRight: 10 }} />
      { `${fullText ? 'Download ' : ''}${option.format} (${option.variant})`.toUpperCase() }
    </Button>
  )
}

SingleDownloadButton.propTypes = {
  dataset: datasetProptype.isRequired,
  fullText: PropTypes.bool
}

SingleDownloadButton.defaultProps = {
  fullText: false
}

export const SplitDownloadButton = ({ dataset, fullText, ...rest }) => {
  const { downloadOptions } = dataset

  const buttonOptions = downloadOptions.map((option) => ({
    key: option.variant,
    uri: option.uri,
    download: true,
    text: `${fullText ? 'Download ' : ''}${option.format} (${option.variant})`.toUpperCase()
  }))

  return (
    <SplitButton
      size="medium"
      variant="contained"
      color="secondary"
      options={buttonOptions}
      renderContent={(content) => (
        <>
          <CloudDownloadIcon style={{ marginRight: 10 }} />
          { content }
        </>
      )}
      {...rest}
    />
  )
}

SplitDownloadButton.propTypes = {
  dataset: datasetProptype.isRequired,
  fullText: PropTypes.bool
}

SplitDownloadButton.defaultProps = {
  fullText: false
}

const VariableStyleDownloadButton = ({ dataset, ...rest }) => {
  if (dataset.downloadOptions.length > 1) {
    return <SplitDownloadButton dataset={dataset} {...rest} />
  }

  return <SingleDownloadButton dataset={dataset} {...rest} />
}

VariableStyleDownloadButton.propTypes = {
  dataset: datasetProptype.isRequired,
  fullText: PropTypes.bool
}

VariableStyleDownloadButton.defaultProps = {
  fullText: false
}

export default VariableStyleDownloadButton
