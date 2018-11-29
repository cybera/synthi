import React from 'react'
import PropTypes from 'prop-types'

import { graphql } from 'react-apollo'

import List from '@material-ui/core/List'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import DeleteIcon from '@material-ui/icons/Delete'
import { withStyles } from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'

import { compose } from '../lib/common'
import { datasetListQuery, deleteDatasetMutation } from '../queries'
import { withDatasets } from '../containers/DatasetList'
import { withNavigation } from '../context/NavigationContext'

import ConfirmationDialog from './ConfirmationDialog'
import { openSnackbar } from './Notifier'

const styles = theme => ({
  root: {
    display: 'block',
    position: 'absolute',
    bottom: 0,
    height: 'calc(100% - 178px)',
    width: '100%',
    overflowY: 'auto'
  }
})

const nameSort = (a, b) => {
  const aNormalized = a.name.toLowerCase()
  const bNormalized = b.name.toLowerCase()

  if (aNormalized < bNormalized) {
    return -1
  }

  if (aNormalized > bNormalized) {
    return 1
  }

  return 0
}

class DatasetList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDataset: {
        id: null,
        name: null
      },
      menuAnchor: null
    }
  }

  static propTypes = {
    classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    deleteDataset: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      selectDataset: PropTypes.func,
      currentDataset: PropTypes.number,
      currentName: PropTypes.string
    }).isRequired,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }))
  }

  static defaultProps = {
    datasets: []
  }

  handleDeleteDialog = (id, name) => {
    this.setState({
      selectedDataset: {
        id: id,
        name: name
      }
    });

    this.onOpen();
  }

  handleDelete = () => {
    const { deleteDataset, navigation } = this.props;
    const { id, name } = this.state.selectedDataset;

    deleteDataset({ 
      variables: { id }, refetchQueries: [{ query: datasetListQuery }] 
    }).then(() => {
      openSnackbar({ message: `'${name}' was successfully removed.` });
    }).catch((err) => {
      openSnackbar({ message: err });
      console.log(err);
    });

    if (id === navigation.currentDataset) {
      navigation.selectDataset(null, null)
    }
  }

  render() {
    const { navigation, datasets, classes } = this.props;
    const { menuAnchor, selectedDataset } = this.state

    return (
      <List component="nav" className={classes.root}>
        {datasets
          .filter(d => d.owner.id === navigation.currentOrg)
          .sort(nameSort)
          .map(({ id, name }) => (
            <ListItem
              button
              key={id}
              selected={navigation.currentDataset === id}
              onClick={() => navigation.selectDataset(id, name)}
            >
              <ListItemText primary={name} />
              <ListItemSecondaryAction>
                <PopupState variant="popover" popupId="dataset-actions">
                  {
                    popupState => (
                      <React.Fragment>
                        <IconButton
                          onClick={(event) => {
                            popupState.open(event)
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu {...bindMenu(popupState)}>
                          <MenuItem onClick={popupState.close}>
                            Edit name
                          </MenuItem>

                          <MenuItem 
                            onClick={() => {
                              popupState.close()
                              this.handleDeleteDialog(id, name)
                            }}
                          >
                            Remove
                          </MenuItem>
                        </Menu>
                      </React.Fragment>
                    )
                  }
                </PopupState>
              </ListItemSecondaryAction>
            </ListItem>
          ))}

        <ConfirmationDialog
          header={`Remove '${this.state.selectedDataset.name}'?`}
          content="Deleting this dataset will permanently destroy all transformations associated with it. Would you like to continue?"
          onClose={this.handleDelete.bind(this)}
          onOpen={(onOpen) => this.onOpen = onOpen}
        />
      </List>
    )
  }
}

export default compose(
  withDatasets,
  graphql(deleteDatasetMutation, { name: 'deleteDataset' }),
  withNavigation,
  withStyles(styles)
)(DatasetList)
