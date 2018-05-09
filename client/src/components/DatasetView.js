import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Typography from 'material-ui/Typography';
import DescriptionIcon from '@material-ui/icons/Description';

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
            id
            name
            columns {
              id
              name
            }
          }
        }
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        const { id, name, columns } = data.dataset[0]

        return <Paper className={classes.root} elevation={4}>
          <Typography variant="headline"><DescriptionIcon/>{name}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                {
                  columns.map(({ id, name }) => <TableCell key={id}>{ name }</TableCell>)
                }                
              </TableRow>
            </TableHead>
          </Table>
          <Typography variant="subheading">ID: {id}</Typography>
        </Paper>
      }}
    </Query>
  }
}

export default withStyles(styles)(DatasetView)