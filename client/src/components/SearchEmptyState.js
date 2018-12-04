import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import EmptySvg from './svg/Empty'

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
  },
  subheading: {
    paddingLeft: 20,
    paddingRight: 20
  }
})

const SearchEmptyState = (props) => {
  const { classes, text } = props
  return (
    <div className={classes.root}>
      <div className={classes.svgContainer}>
        <EmptySvg color="#303f9f" className={classes.svg} />
      </div>
      <Typography variant="subheading" guttertop="true" className={classes.heading}>
        There&apos;s nothing here.
      </Typography>
      <Typography variant="body1" className={classes.subheading}>
        { text }
      </Typography>
    </div>
  )
}

SearchEmptyState.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  text: PropTypes.string.isRequired
}

export default withStyles(styles)(SearchEmptyState)
