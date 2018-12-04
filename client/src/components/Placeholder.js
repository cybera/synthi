import React from 'react'
import PropTypes from 'prop-types'

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
  const { classes, heading, children } = props

  return (
    // <Paper className={classes.root} elevation={4}>
    //   <Typography variant="display2" gutterBottom>
    //     { heading }
    //   </Typography>
    //   <Typography variant="headline" gutterBottom>
    //     { children }
    //   </Typography>
    // </Paper>
    <div className={classes.root}>
      <div className={classes.empty}>
        <div className={classes.svgContainer}>
          <NoDataSvg color="#303f9f" className={classes.svg} />
        </div>
        <div className={classes.text}>
          <Typography variant="headline">
            Add some data to your dataset
          </Typography>
          <Typography variant="subheading" className={classes.subheader}>
            Upload a CSV file containing the underlying data or generate it from existing datasets.
          </Typography>
        </div>
        <DatasetUploadButton id={id} />
        <DatasetComputeModeButton id={id} />
      </div>
    </div>
  )
}

export default withStyles(styles)(Placeholder)
