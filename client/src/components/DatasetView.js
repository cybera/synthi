import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Typography from 'material-ui/Typography';

import { withStyles } from 'material-ui/styles'

import { datasetViewQuery } from '../queries'

import IconButton from 'material-ui/IconButton'
import ChartIcon from '@material-ui/icons/ShowChart'

import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  }),
  rightIcon: {
    marginLeft: theme.spacing.unit,
  }
});

class DatasetView extends React.Component {
  render() {
    const { classes, id, navigation } = this.props

    if (id == null) return <div></div>

    return <Query query={datasetViewQuery} variables={ { id: id } }>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        const { id, name, columns, samples } = data.dataset[0]

        const selected_columns = columns
          .slice(0) // dup the array to avoid modification error during sort
          .sort((a,b) => { return a.order - b.order })
          .slice(0,8)
        const sample_rows = samples.map(s => {
          const record = JSON.parse(s)
          return selected_columns.map(c => record[c.name])
        })

        return <Paper className={classes.root} elevation={4}>
          <Typography variant="headline">
            {`Dataset: ${name}`}
            <IconButton aria-label="Chart" onClick={e => navigation.switchMode('chart-editor')}>
              <ChartIcon />
            </IconButton>
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                {
                  selected_columns.map(({ id, name }) => <TableCell key={id}>{ name }</TableCell>)
                }                
              </TableRow>
            </TableHead>
            <TableBody>
              {
                sample_rows.map((values, row_index) => (
                  <TableRow key={row_index}>
                    { 
                      values.map((value, column_index) => ( 
                        <TableCell key={column_index}>{ value }</TableCell>
                      )) 
                    }
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </Paper>
      }}
    </Query>
  }
}

export default compose(
  withStyles(styles),
  withNavigation
)(DatasetView)