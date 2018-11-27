import React from 'react'
import PropTypes from 'prop-types'

import { graphql } from 'react-apollo'

import List from '@material-ui/core/List'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import { withStyles } from '@material-ui/core/styles'

import { compose } from '../lib/common'
import { datasetListQuery, deleteDatasetMutation } from '../queries'
import { withDatasets } from '../containers/DatasetList'
import { withNavigation } from '../context/NavigationContext'

import ConfirmationDialog from './ConfirmationDialog'
import { openSnackbar } from './Notifier'

const styles = theme => ({
  root: {
    display: 'flex'
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
      toRemove: {
        id: null,
        name: null
      }
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

  handleOpenDialog = (id, name) => {
    this.setState({
      toRemove: {
        id: id,
        name: name
      }
    });

    this.onOpen();
  }

  handleDelete = () => {
    const { deleteDataset, navigation } = this.props;
    const { id, name } = this.state.toRemove;

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

    return (
      <List component="nav">
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
                {/* <IconButton aria-label="Delete" onClick={() => this.handleOpenDialog(id, name)}>
                  <DeleteIcon />
                </IconButton> */}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        <ConfirmationDialog
          header={`Remove '${this.state.toRemove.name}'?`}
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
