import React from "react";
import { Query } from "react-apollo";

import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { datasetListQuery } from '../queries'

class DatasetList extends React.Component {
  render() {
    const { selectDataset } = this.props

    return <Query query={datasetListQuery}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        return <List component="nav">
          {data.dataset.map(({ id, name }) => (
            <ListItem button key={id} onClick={(e) => selectDataset(id, e)}>{`${name}`}</ListItem>
          ))}
        </List>
      }}
    </Query>
  }
}

export default DatasetList