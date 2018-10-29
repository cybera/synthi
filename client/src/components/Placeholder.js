import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit,
    paddingTop: 200,
    paddingLeft: 100,
    paddingBottom: 200,
    height: 400
  }
});

const Placeholder = (props) => {
  const { classes, heading, children } = props

  return (
    <Paper className={classes.root} elevation={4}>
      <Typography variant="display2" gutterBottom>
        { heading }
      </Typography>
      <Typography variant="headline" gutterBottom>
        { children }
      </Typography>
    </Paper>
  )
}

export default withStyles(styles)(Placeholder)
