import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const styles = () => ({
  root: {
    marginBottom: 15,
    marginTop: 20
  },
  error: {
    color: '#F44336',
  },
  message: {
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
    color: '#F44336',
  }
})

const WarningBanner = (props) => {
  const {
    header,
    message,
    advice,
    classes
  } = props

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.error}>
        {header}
      </Typography>
      <Typography variant="body2" className={classes.message}>
        {message}
      </Typography>
      <Typography variant="body1">
        {advice}
      </Typography>
    </div>
  )
}

WarningBanner.propTypes = {
  header: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  advice: PropTypes.string.isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

export default withStyles(styles)(WarningBanner)
