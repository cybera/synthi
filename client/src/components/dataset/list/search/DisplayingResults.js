import React from 'react'
import PropTypes from 'prop-types'
import Pluralize from 'react-pluralize'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: (theme.spacing(2)) - 2,
    marginBottom: theme.spacing(1),
    color: theme.palette.secondary.light,
    textAlign: 'left',
    borderBottom: 'solid 1px',
    borderBottomColor: theme.palette.secondary.light
  }
})


const DisplayingResults = (props) => {
  const { classes, count } = props

  return (
    <Typography variant="body1" className={classes.root}>
      Retrieved <Pluralize singular="result" count={count} />
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
