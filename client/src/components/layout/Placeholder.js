import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

import { FolderSvg } from './svg'

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
    paddingTop: 200,
    paddingLeft: 100,
    paddingBottom: 200,
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

const Placeholder = (props) => {
  const { classes, children } = props

  return (
    <div className={classes.root}>
      <div className={classes.empty}>
        <div className={classes.svgContainer}>
          <FolderSvg color="#303f9f" className={classes.svg} />
        </div>
        <div className={classes.text}>
          {children}
        </div>
      </div>
    </div>
  )
}

Placeholder.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  children: PropTypes.node.isRequired
}

export default withStyles(styles)(Placeholder)
