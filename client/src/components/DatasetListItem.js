import React from 'react'
import PropTypes from 'prop-types'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'

import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'

import DatasetListItemMenu from './DatasetListItemMenu'

class DatasetListItem extends React.Component {
  constructor(props) {
    super(props)
    this.selectDataset = this.selectDataset.bind(this)
  }

  selectDataset = () => {
    const { dataset: { id, name }, navigation } = this.props
    navigation.selectDataset(id, name)
  }

  render() {
    const {
      dataset,
      navigation
    } = this.props

    const active = navigation.currentDataset === dataset.id
    

    return (
      <ListItem
        button
        selected={active}
        onClick={this.selectDataset}
      >
        <ListItemText primary={<Typography variant="subheading" component="span">{dataset.name}</Typography>} disableTypography />
        <DatasetListItemMenu dataset={dataset} />
      </ListItem>
    )
  }
}

DatasetListItem.propTypes = {
  dataset: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  navigation: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetListItem.defaultProps = {
  dataset: {
    id: null,
    name: null
  }
}

export default compose(
  withNavigation
)(DatasetListItem)
