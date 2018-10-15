import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import DatasetView from './DatasetView'
import DatasetList from './DatasetList'
import NewDatasetButton from '../containers/NewDatasetButton'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
})

const DatasetBrowser = (props) => {
  const { classes, selectedDataset } = props

  return (
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={3}>
          <NewDatasetButton />
          <DatasetList />
        </Grid>
        <Grid item xs={9}>
          <DatasetView id={selectedDataset} />
        </Grid>
      </Grid>
    </div>
  )
}

DatasetBrowser.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  selectedDataset: PropTypes.number
}

DatasetBrowser.defaultProps = {
  selectedDataset: null
}

export default withStyles(styles)(DatasetBrowser)
