import React from 'react'
import { withStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
  root: {
    marginBottom: 15,
    marginTop: 20
  },
  error: {
    color: '#F44336',
  },
  message: {
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
    color: '#F44336',
  }
})

class WarningBanner extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {header, message, advice, classes} = this.props
    return(
      <div className={classes.root}>
        <Typography variant="h5" className={classes.error}>
          {header}
        </Typography>
        <Typography variant="body2" className={classes.message}>
          {message}
        </Typography>
        <Typography variant="body1">
          {advice}
        </Typography>
      </div>
    )
  }
}

export default withStyles(styles)(WarningBanner)