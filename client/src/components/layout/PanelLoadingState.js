import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    marginTop: 50,
    textAlign: 'center',
    width: '100%'
  },
  loading: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2)
  }
})

const PanelLoadingState = (props) => {
  const { classes } = props

  return (
    <div className={classes.root}>
      <CircularProgress className={classes.loading} color="secondary" />
      <Typography variant="body2">
        Loading...
      </Typography>
    </div>
  )
}

PanelLoadingState.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

export default withStyles(styles)(PanelLoadingState)
