import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'

import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'

import { datasetListQuery, deleteDatasetMutation } from '../queries'
import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'
import { openSnackbar } from './Notifier'

import ConfirmationDialog from './ConfirmationDialog'

const styles = () => ({
  delete: {
    color: 'red'
  },
  action: {
    zIndex: 1000
  },
  root: {
    padding: 0
  },
  listItem: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 12,
    paddingBottom: 12,
    display: 'block',
    width: '100%'
  }
})

class DatasetListItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDeleting: false,
      showDialog: false,
      anchorEl: null
    }

    this.handleDelete = this.handleDelete.bind(this)
    this.selectDataset = this.selectDataset.bind(this)
    this.handleOpenMenu = this.handleOpenMenu.bind(this)
    this.handleCloseMenu = this.handleCloseMenu.bind(this)
  }

  selectDataset = () => {
    const { dataset: { id, name }, navigation } = this.props
    navigation.selectDataset(id, name)
  }

  handleOpenMenu = (event) => {
    event.stopPropagation()
    this.setState({ anchorEl: event.currentTarget })
  }

  handleCloseMenu = (event) => {
    event.stopPropagation()
    this.setState({ anchorEl: null })
  }

  handleDeleteDialog() {
    this.setState({ showDialog: true })
  }

  handleDelete(agree) {
    const { deleteDataset, navigation, dataset: { id, name } } = this.props

    this.setState({ showDialog: false })

    if (agree) {
      deleteDataset({
        variables: { id },
        refetchQueries: [{
          query: datasetListQuery,
          variables: { org: { id: navigation.currentOrg } }
        }]
      }).then(() => {
        openSnackbar({ message: `'${name}' was successfully removed.` })
      }).catch((err) => {
        openSnackbar({ message: err })
      })

      if (id === navigation.currentDataset) {
        navigation.selectDataset(null, null)
      }
    }
  }


  render() {
    const {
      dataset: { id, name },
      navigation,
      classes
    } = this.props

    const { isDeleting, showDialog, anchorEl } = this.state
    const active = navigation.currentDataset === id
    const open = Boolean(anchorEl)

    return (
      <ListItem
        button
        selected={active}
        className={classes.root}
      >
        <ListItemText
          primary={name}
          classes={{ primary: classes.listItem }}
          onClick={() => this.selectDataset()}
        />

        <ListItemSecondaryAction
          className={classes.action}
          onClick={this.openMenu}
        >
          <IconButton
            aria-owns={open ? `dataset-item-${id}` : undefined}
            aria-haspopup="true"
            onClick={this.handleOpenMenu}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            id={`dataset-item-${id}`}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            open={open}
            onClose={this.handleCloseMenu}
          >
            <MenuItem>
              Rename
            </MenuItem>

            <MenuItem
              onClick={this.handleDeleteDialog}
              className={classes.delete}
            >
              Delete
            </MenuItem>
          </Menu>
        </ListItemSecondaryAction>

        <ConfirmationDialog
          header={`Remove '${name}'?`}
          content="Deleting this dataset will permanently destroy all transformations associated with it. Would you like to continue?"
          onClose={this.handleDelete}
          open={showDialog}
          continueLabel="Discard"
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
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  deleteDataset: PropTypes.func.isRequired,
  navigation: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetListItem.defaultProps = {
  dataset: {
    id: null,
    name: null
  }
}

export default compose(
  withNavigation,
  graphql(deleteDatasetMutation, { name: 'deleteDataset' }),
  withStyles(styles)
)(DatasetListItem)
