import React from 'react'
import PropTypes from 'prop-types'

import ListItem from '@material-ui/core/ListItem'
import DatasetNameEditor from '../containers/DatasetNameEditor'

import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'

import DatasetListItemMenu from './DatasetListItemMenu'

class DatasetListItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      editing: false
    }

    this.selectDataset = this.selectDataset.bind(this)
  }

  selectDataset = () => {
    const { dataset: { id, name }, navigation } = this.props
    navigation.selectDataset(id, name)
  }

  changeEditMode = (newState) => {
    console.log('Hello')
    this.setState({ editing: newState })
  }

  render() {
    const {
      dataset,
      navigation
    } = this.props

    const { editing } = this.state

    const active = navigation.currentDataset === dataset.id

    return (
      <ListItem
        button
        selected={active}
        onClick={this.selectDataset}
      >
        <DatasetNameEditor
          dataset={dataset}
          editing={editing}
          changeMode={this.changeEditMode}
          variant="subtitle1"
        />
        <DatasetListItemMenu
          dataset={dataset}
          onRename={this.changeEditMode}
        />
      </ListItem>
    )
  }
}

DatasetListItem.propTypes = {
  dataset: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  navigation: PropTypes.objectOf(PropTypes.any).isRequired,
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
