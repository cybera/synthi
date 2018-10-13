import React, { Fragment } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles'

import { datasetViewQuery } from '../queries'

import IconButton from '@material-ui/core/IconButton'
import ChartIcon from '@material-ui/icons/ShowChart'
import LinearProgress from '@material-ui/core/LinearProgress';

import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'
import ADIButton from './ADIButton'
import ToggleVisibility from './ToggleVisibility'

import DataTableView from './DataTableView'
import DatasetGenerator from './DatasetGenerator'
import DatasetColumnChips from './DatasetColumnChips'
import DatasetNameEditor from '../containers/DatasetNameEditor'
import DatasetEditor from '../containers/DatasetEditor'
import DatasetModeToggle from '../containers/DatasetModeToggle'

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
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.subscribeToMore()
  }

  render() {
    const { classes, navigation, dataset } = this.props

    const displayColumns = dataset.columns
    const selectedColumns = displayColumns.filter(c => c.visible)

    const sample_rows = dataset.samples.map(s => {
      const record = JSON.parse(s)
      return selectedColumns.map(c => record[c.name])
    })

    return <Paper className={classes.root} elevation={4}>
             <Typography variant="headline">
               <DatasetNameEditor dataset={dataset}/>
               <IconButton aria-label="Chart" onClick={e => navigation.switchMode('chart-editor')}>
                 <ChartIcon />
               </IconButton>
               <DatasetModeToggle dataset={dataset}/>
             </Typography>
             <DatasetEditor dataset={dataset} />
             <DatasetColumnChips columns={displayColumns}/>
             <ToggleVisibility visible={dataset.generating}>
               <LinearProgress/>
             </ToggleVisibility>
             <ToggleVisibility visible={!dataset.generating}>
               <DataTableView columns={selectedColumns} rows={sample_rows}/>
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