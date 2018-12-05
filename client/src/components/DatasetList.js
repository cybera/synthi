import React from 'react'
import PropTypes from 'prop-types'

import List from '@material-ui/core/List'
import { withStyles } from '@material-ui/core/styles'
import Pluralize from 'react-pluralize'
import Typography from '@material-ui/core/Typography'

import { compose } from '../lib/common'
import { withDatasets } from '../containers/DatasetList'
import { withNavigation } from '../context/NavigationContext'

import DatasetListItem from './DatasetListItem'

const styles = theme => ({
  root: {
    display: 'block',
    position: 'absolute',
    bottom: 0,
    height: 'calc(100% - 178px)',
    width: '100%',
    overflowY: 'auto'
  },
  searchResults: {
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit,
    color: theme.palette.secondary.light,
    textAlign: 'right',
    borderBottom: 'solid 1px',
    borderBottomColor: theme.palette.secondary.light
  }
})

const DatasetList = (props) => {
  const {
    navigation,
    datasets,
    classes,
    searchString
  } = props

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

  return (
    <List component="nav" className={classes.root}>
      {searchString && (
        <Typography variant="body1" className={classes.searchResults}>
          Displaying
          <Pluralize singular="result" count={datasets.length} />
        </Typography>
      )}
      {datasets
        .filter(d => d.owner.id === navigation.currentOrg)
        .sort(collator.compare)
        .reverse()
        .map(dataset => (
          <DatasetListItem
            key={dataset.id}
            dataset={dataset}
          />
        ))}
    </List>
  )
}

DatasetList.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  navigation: PropTypes.shape({
    selectDataset: PropTypes.func,
    currentDataset: PropTypes.number,
    currentName: PropTypes.string
  }).isRequired,
  datasets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  })),
  searchString: PropTypes.string
}

DatasetList.defaultProps = {
  datasets: [],
  searchString: null
}

export default compose(
  withDatasets,
  withNavigation,
  withStyles(styles)
)(DatasetList)
