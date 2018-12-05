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

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import { datasetListQuery, deleteDatasetMutation } from '../queries'
import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'
import { openSnackbar } from './Notifier'

import ConfirmationDialog from './ConfirmationDialog'

const styles = () => ({
  delete: {
    color: 'red'
  }
})

class DatasetListItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDeleting: false,
      showDialog: false
    }

    this.handleDelete = this.handleDelete.bind(this)
    this.selectDataset = this.selectDataset.bind(this)
  }

  selectDataset() {
    const { dataset: { id, name }, navigation } = this.props
    navigation.selectDataset(id, name)
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
    const { isDeleting, showDialog } = this.state
    const active = navigation.currentDataset === id

    return (
      <ListItem
        button
        selected={active}
      >
        <ListItemText
          primary={name}
          onClick={this.selectDataset}
        />

        <ListItemSecondaryAction>
          { !isDeleting && (
            <PopupState variant="popover" popupId="dataset-actions">
              {popupState => (
                <React.Fragment>
                  <IconButton {...bindTrigger(popupState)}>
                    <MoreVertIcon />
                  </IconButton>

                  <Menu {...bindMenu(popupState)}>
                    <MenuItem onClick={popupState.close}>
                      Rename
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        popupState.close()
                        this.handleDeleteDialog()
                      }}
                      className={classes.delete}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              )}
            </PopupState>
          )}
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
  graphql(deleteDatasetMutation, { name: 'deleteDataset' }),
  withStyles(styles)
)(DatasetListItem)
