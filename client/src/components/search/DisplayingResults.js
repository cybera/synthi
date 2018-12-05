import React from 'react'
import PropTypes from 'prop-types'
import Pluralize from 'react-pluralize'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit,
    color: theme.palette.secondary.light,
    textAlign: 'right',
    borderBottom: 'solid 1px',
    borderBottomColor: theme.palette.secondary.light
  }
})


const DisplayingResults = (props) => {
  const { classes, count } = props

  return (
    <Typography variant="body1" className={classes.root}>
      Displaying
      <Pluralize singular="result" count={count} />
    </Typography>
  )
}

DisplayingResults.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  count: PropTypes.number
}

DisplayingResults.defaultProps = {
  count: null
}

export default withStyles(styles)(DisplayingResults)
