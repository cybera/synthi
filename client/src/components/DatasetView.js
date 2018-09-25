import React, { Fragment } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import { withStyles } from 'material-ui/styles'

import { datasetViewQuery } from '../queries'

import IconButton from 'material-ui/IconButton'
import ChartIcon from '@material-ui/icons/ShowChart'
import LinearProgress from '@material-ui/core/LinearProgress';

import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'
import ADIButton from './ADIButton'
import ToggleVisibility from './ToggleVisibility'

import DataTableView from './DataTableView'
import DatasetGenerator from './DatasetGenerator'

const DATASET_GENERATION_SUBSCRIPTION = gql`
  subscription onDatasetGenerated($id: Int!) {
    datasetGenerated(id: $id) {
      id
    }
  }
`;

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  }
});

class DatasetView extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore()
  }

  render() {
    const { classes, navigation, dataset } = this.props

    const selected_columns = dataset.columns
      .slice(0) // dup the array to avoid modification error during sort
      .sort((a,b) => { return a.order - b.order })
      .slice(0,8)

    const sample_rows = dataset.samples.map(s => {
      const record = JSON.parse(s)
      return selected_columns.map(c => record[c.name])
    })

    return <Paper className={classes.root} elevation={4}>
             <Typography variant="headline">
               {`Dataset: ${dataset.name}`}
               <IconButton aria-label="Chart" onClick={e => navigation.switchMode('chart-editor')}>
                 <ChartIcon />
               </IconButton>
             </Typography>
             <DatasetGenerator>
               {({generateDataset}) => {
                 return dataset.computed && <ADIButton disabled={dataset.generating} onClick={e => generateDataset(dataset.id)}>Generate!</ADIButton>
               }}
             </DatasetGenerator>
             <ToggleVisibility visible={dataset.generating}>
               <LinearProgress/>
             </ToggleVisibility>
             <ToggleVisibility visible={!dataset.generating}>
               <DataTableView columns={selected_columns} rows={sample_rows}/>
            </ToggleVisibility>
           </Paper>
  }
}

const StyledDatasetView = compose(
  withStyles(styles),
  withNavigation
)(DatasetView)

const ConnectedDatasetView = (props) => (
  <Query query={datasetViewQuery} variables={ { id: props.id } }>
    {({ subscribeToMore, refetch, loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error!</p>;

      if (props.id == null) return <div></div>

      const more = () => subscribeToMore({
        document: DATASET_GENERATION_SUBSCRIPTION,
        variables: { id: props.id },
        updateQuery: (prev, { subscriptionData }) => {
          // Actually kick off a refetch of the data, but until that's finished, return
          // the current data.
          refetch()
          return prev
        }
      })

      return <StyledDatasetView dataset={ data.dataset[0] } subscribeToMore={more} { ...props } />
    }}
  </Query>
)

export default ConnectedDatasetView