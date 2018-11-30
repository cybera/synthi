import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
  root: {
    marginTop: 50,
    textAlign: 'center',
    width: '100%'
  },
  loading: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing.unit * 2
  }
})

class SearchLoadingState extends React.Component {
  render() {
    const { classes, content } = this.props
    return(
      <div className={classes.root}>
        <CircularProgress className={classes.loading} color="secondary" />
        <Typography variant="body2">
          {content}
        </Typography>
      </div>
    )
  }
}

export default withStyles(styles)(SearchLoadingState)