import React from 'react'
import PropTypes from 'prop-types'

import List from '@material-ui/core/List'
import { withStyles } from '@material-ui/core/styles'

import { compose } from '../lib/common'
import { withDatasets } from '../containers/DatasetList'
import { withNavigation } from '../context/NavigationContext'

import DatasetListItem from './DatasetListItem'
import DisplayingResults from './search/DisplayingResults'

const styles = () => ({
  root: {
    display: 'block',
    position: 'absolute',
    bottom: 0,
    height: 'calc(100% - 178px)',
    width: '100%',
    overflowY: 'auto'
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

      {searchString && <DisplayingResults count={datasets.length} />}

      {datasets
        .filter(d => d.owner.uuid === navigation.currentOrg)
        .sort(collator.compare)
        .reverse()
        .map(dataset => (
          <DatasetListItem
            key={dataset.uuid}
            dataset={dataset}
          />
        ))}

    </List>
  )
}

DatasetList.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  navigation: PropTypes.shape({
    selectDataset: PropTypes.func,
    currentDataset: PropTypes.string,
    currentName: PropTypes.string
  }).isRequired,
  datasets: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
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
