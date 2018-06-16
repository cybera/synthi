import React from 'react'

import DatasetView from "./DatasetView"
import DatasetList from "./DatasetList"
import NewDatasetDialog from "./NewDatasetDialog"

import Grid from 'material-ui/Grid'
import { withStyles } from 'material-ui/styles'

import NavigationContext from '../context/NavigationContext'

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

class DatasetBrowser extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { classes, selectedDataset } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={3}>
            <NewDatasetDialog/>
            <DatasetList/>
          </Grid>
          <Grid item xs={9}>
            <DatasetView id={selectedDataset}/>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(DatasetBrowser)