import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
});

class DatasetView extends React.Component {
  render() {
    const { classes, id } = this.props

    if (id == null) return <div></div>

    return <Query
      query={gql`
        {
          dataset(id: ${id}) {
            id,
            name
          }
        }
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        const { id, name } = data.dataset[0]

        return <Paper className={classes.root} elevation={4}>
          <p>Dataset: {name}</p>
          <p>ID: {id}</p>
        </Paper>
      }}
    </Query>
  }
}

export default withStyles(styles)(DatasetView)