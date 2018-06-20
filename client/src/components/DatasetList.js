import React from "react";
import { Query, graphql } from "react-apollo";
import gql from 'graphql-tag'
import List, { ListItem, 
               ListItemIcon, 
               ListItemSecondaryAction, 
               ListItemText } from 'material-ui/List'
import IconButton from 'material-ui/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import { compose } from '../lib/common'

import { datasetListQuery, deleteDatasetMutation } from '../queries'

import { withDatasets } from '../containers/DatasetList'
import { withNavigation } from '../context/NavigationContext'

class DatasetList extends React.Component {
  handleDelete = (id, event) => {
    this.props.deleteDataset({ variables: { id: id }, refetchQueries: [{ query: datasetListQuery }]})
  }

  render() {
    const { navigation, datasets } = this.props

    return (
      <List component="nav">
        {datasets.map(({ id, name }) => (
          <ListItem button key={id} onClick={(e) => navigation.selectDataset(id)}>
            <ListItemText primary={name}/>
            <ListItemSecondaryAction>
              <IconButton aria-label="Delete" onClick={e => this.handleDelete(id, e)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    )
  }
}

export default compose(
  withDatasets,
  graphql(deleteDatasetMutation, { name: 'deleteDataset' }),
  withNavigation
)(DatasetList)
