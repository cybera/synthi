import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import ChartIcon from '@material-ui/icons/ShowChart'
import LinearProgress from '@material-ui/core/LinearProgress';

import { datasetViewQuery } from '../queries'
import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'
import ToggleVisibility from './ToggleVisibility'
import DataTableView from './DataTableView'
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
  static propTypes = {
    subscribeToMore: PropTypes.func.isRequired,
    navigation: PropTypes.shape({ switchMode: PropTypes.func }).isRequired,
    classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    dataset: PropTypes.object // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    dataset: null
  }

  componentDidMount() {
    const { subscribeToMore } = this.props

    subscribeToMore()
  }

  render() {
    const { classes, navigation, dataset } = this.props

    const displayColumns = dataset.columns
    const selectedColumns = displayColumns.filter(c => c.visible)

    const sampleRows = dataset.samples.map((s) => {
      const record = JSON.parse(s)
      return selectedColumns.map(c => record[c.name])
    })

    return (
      <Paper className={classes.root} elevation={4}>
        <Typography variant="headline">
          <DatasetNameEditor dataset={dataset} />
          <IconButton aria-label="Chart" onClick={() => navigation.switchMode('chart-editor')}>
            <ChartIcon />
          </IconButton>
          <DatasetModeToggle dataset={dataset} />
        </Typography>
        <DatasetEditor dataset={dataset} />
        <DatasetColumnChips columns={displayColumns} />
        <ToggleVisibility visible={dataset.generating}>
          <LinearProgress />
        </ToggleVisibility>
        <ToggleVisibility visible={!dataset.generating}>
          <DataTableView columns={selectedColumns} rows={sampleRows} />
        </ToggleVisibility>
      </Paper>
    )
  }
}

const StyledDatasetView = compose(
  withStyles(styles),
  withNavigation
)(DatasetView)

const ConnectedDatasetView = (props) => {
  const { id } = props

  return (
    <Query query={datasetViewQuery} variables={{ id }}>
      {({
        subscribeToMore,
        refetch,
        loading,
        error,
        data
      }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        if (props.id == null) return <div />

        const more = () => subscribeToMore({
          document: DATASET_GENERATION_SUBSCRIPTION,
          variables: { id: props.id },
          updateQuery: (prev) => {
            // Actually kick off a refetch of the data, but until that's finished, return
            // the current data.
            refetch()
            return prev
          }
        })

        return <StyledDatasetView dataset={data.dataset[0]} subscribeToMore={more} {...props} />
      }}
    </Query>
  )
}

export default ConnectedDatasetView
