import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
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
})

class DatasetListItemMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showDialog: false,
      anchorEl: null
    }

    this.handleDelete = this.handleDelete.bind(this)
    this.handleOpenMenu = this.handleOpenMenu.bind(this)
    this.handleCloseMenu = this.handleCloseMenu.bind(this)
  }

  handleOpenMenu = (event) => {
    event.stopPropagation()
    this.setState({ anchorEl: event.currentTarget })
  }

  handleCloseMenu = (event) => {
    event.stopPropagation()
    this.setState({ anchorEl: null })
  }

  handleDeleteDialog = (event) => {
    event.stopPropagation()
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
    const { classes, dataset: { id, name } } = this.props
    const { showDialog, anchorEl } = this.state

    const open = Boolean(anchorEl)

    return (
      <div>
        <ListItemSecondaryAction>
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
      </div>
    )
  }
}

DatasetListItemMenu.propTypes = {
  deleteDataset: PropTypes.func.isRequired,
  dataset: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  navigation: PropTypes.objectOf(PropTypes.any).isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetListItemMenu.defaultProps = {
  dataset: {
    id: null,
    name: null
  }
}

export default compose(
  withNavigation,
  graphql(deleteDatasetMutation, { name: 'deleteDataset' }),
  withStyles(styles)
)(DatasetListItemMenu)
