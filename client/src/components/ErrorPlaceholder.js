import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

import WarnSvg from './svg/Warn'

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit,
    height: 400
  },
  empty: {
    textAlign: 'center'
  },
  svgContainer: {
    marginTop: 40,
    maxWidth: 300,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  svg: {
    width: '100%',
    display: 'block'
  },
  text: {
    marginBottom: 10
  },
  subheader: {
    maxWidth: 420,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 15
  }
});

const ErrorPlaceholder = (props) => {
  const { classes, children } = props

  return (
    <div className={classes.root}>
      <div className={classes.empty}>
        <div className={classes.svgContainer}>
          <WarnSvg color="#303f9f" className={classes.svg} />
        </div>
        <div className={classes.text}>
          {children}
        </div>
      </div>
    </div>
  )
}

ErrorPlaceholder.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  children: PropTypes.node.isRequired
}

export default withStyles(styles)(ErrorPlaceholder)
