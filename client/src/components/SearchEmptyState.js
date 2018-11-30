import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import EmptySvg from './svg/Empty'

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
  },
  svgContainer: {
    display: 'block',
    width: 200,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing.unit
  },
  svg: {
    display: 'block',
    width: '100%',
  },
  heading: {
    color: theme.palette.secondary.main
  }
})

class SearchEmptyState extends React.Component {
  render() {
    const { classes } = this.props
    return(
      <div className={classes.root}>
        <div className={classes.svgContainer}>
          <EmptySvg color="#303f9f" className={classes.svg} />
        </div>
        <Typography variant="subheading" gutterTop className={classes.heading}>
          There's nothing here.
        </Typography>
        <Typography variant="body1">
          Your search did not return any results.
        </Typography>
      </div>
    )
  }
}

export default withStyles(styles)(SearchEmptyState)