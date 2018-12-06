import React, { Fragment } from 'react'

import Typography from '@material-ui/core/Typography'

import CSVOptions from './CSVOptions'

// At some point, there will be other filetypes that we'll want to
// provide parsing options for.
const ParsingOptions = (props) => {
  const { error } = props

  const ErrorMessage = () => (error ? (
    <Fragment>
      <Typography component="h2" variant="h6" color="error">
        Error Message:
      </Typography>
      <Typography color="error">{error.message}</Typography>
    </Fragment>
  ) : <Fragment />)


  return (
    <div>
      <Typography component="h2" variant="h5">
        More information required
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        The file you uploaded could not be processed automatically. Please provide some more
        information about the file contents.
      </Typography>
      <ErrorMessage />
      <CSVOptions {...props} />
    </div>
  )
}

export default ParsingOptions
