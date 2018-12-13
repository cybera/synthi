import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';

import ListItem from '@material-ui/core/ListItem'
import { withStyles } from '@material-ui/core/styles'

import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'

import DatasetListItemMenu from './DatasetListItemMenu'
import DatasetNameEditor from '../containers/DatasetNameEditor'

const styles = () => ({
  hide: {
    display: 'none'
  }
})

class DatasetListItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      editing: false,
      deleting: false
    }

    this.toggleDelete = this.toggleDelete.bind(this)
    this.changeEditMode = this.changeEditMode.bind(this)
  }

  selectDataset = (event) => {
    const { dataset: { id }, navigation } = this.props
    const clickedListItem = event.target === event.currentTarget
    const clickedDatasetTitle = event.target.nodeName === 'SPAN'

    if (clickedListItem || clickedDatasetTitle) navigation.selectDataset(id)
  }

  toggleDelete = () => {
    const { deleting } = this.state
    this.setState({ deleting: !deleting })
  }

  changeEditMode = (newState) => {
    this.setState({ editing: newState })
  }

  render() {
    const {
      dataset,
      navigation,
      classes
    } = this.props

    const {
      editing,
      deleting
    } = this.state

    const active = navigation.currentDataset === dataset.id

    return (
      <ListItem
        button
        selected={active}
        onClick={this.selectDataset}
        className={classNames(deleting && classes.hide)}
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
          onDelete={this.toggleDelete}
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
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetListItem.defaultProps = {
  dataset: {
    id: null,
    name: null
  }
}

export default compose(
  withNavigation,
  withStyles(styles)
)(DatasetListItem)
