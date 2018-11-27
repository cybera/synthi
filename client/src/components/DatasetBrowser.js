import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import SearchBar from './SearchBar'

import DatasetDetails from './DatasetDetails'
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
  }
})

class DatasetBrowser extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedDataset: PropTypes.number
  }

  static defaultProps = {
    selectedDataset: null
  }

  state = {
    searchString: undefined
  }

  render() {
    const { classes, selectedDataset } = this.props
    const { searchString } = this.state

    return (
      <div className={classes.root}>
        <Grid container spacing={16}>
          <Grid container spacing={16}>
            <Grid item xs={3}>
              <NewDatasetButton />
            </Grid>
            <Grid item xs={9}>
              <SearchBar
                onRequestSearch={value => this.setState({ searchString: value })}
                onCancelSearch={() => this.setState({ searchString: undefined })}
              />
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <DatasetList searchString={searchString} />
          </Grid>
          <Grid item xs={9}>
            <DatasetDetails id={selectedDataset} />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(DatasetBrowser)
