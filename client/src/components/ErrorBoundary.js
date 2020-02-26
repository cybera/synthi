import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import ErrorPlaceholder from './layout/warnings/ErrorPlaceholder'

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing(1)
  }
})

class ErrorBoundary extends React.Component {
  constructor() {
    super()

    this.state = {
      error: null
    }
  }

  componentDidCatch(error) {
    console.log(error)
    this.setState({ error })
  }

  render() {
    const { classes, children, FallbackComponent } = this.props
    const { error } = this.state

    if (error !== null) {
      return (
        <div className={classes.root}>
          <FallbackComponent />
        </div>
      )
    }

    return children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  FallbackComponent: PropTypes.node,
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
}

ErrorBoundary.defaultProps = {
  children: null,
  FallbackComponent: ErrorPlaceholder
}

export const withErrorBoundary = (Component, FallbackComponent) => (props) => (
  <ErrorBoundary FallbackComponent={FallbackComponent}>
    <Component {...props} />
  </ErrorBoundary>
)

export default withStyles(styles)(ErrorBoundary)
