import React from "react";
import { Query, graphql } from "react-apollo";
import gql from 'graphql-tag'
import List, { ListItem, 
               ListItemIcon, 
               ListItemSecondaryAction, 
               ListItemText } from 'material-ui/List'
import IconButton from 'material-ui/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'

import { datasetListQuery, deleteDatasetMutation } from '../queries'

import NavigationContext from '../context/NavigationContext'

class DatasetList extends React.Component {
  handleDelete = (id, event) => {
    this.props.mutate({ variables: { id: id }, refetchQueries: [{ query: datasetListQuery }]})
  }

  render() {
    return <Query query={datasetListQuery}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        return (
          <NavigationContext.Consumer>
            { ({ selectDataset }) => 
              <List component="nav">
                {data.dataset.map(({ id, name }) => (
                  <ListItem button key={id} onClick={(e) => selectDataset(id)}>
                    <ListItemText primary={name}/>
                    <ListItemSecondaryAction>
                      <IconButton aria-label="Delete" onClick={e => this.handleDelete(id, e)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            }
          </NavigationContext.Consumer>
        )
      }}
    </Query>
  }
}

export default graphql(deleteDatasetMutation)(DatasetList)