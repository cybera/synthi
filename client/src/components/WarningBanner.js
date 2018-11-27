import React from 'react'
import { withStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
  root: {
    marginBottom: 15
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
        <Typography variant="title">
          {header}
        </Typography>
        <Typography variant="subheading">
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