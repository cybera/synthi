import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import ChartIcon from '@material-ui/icons/ShowChart'
import LinearProgress from '@material-ui/core/LinearProgress'

import { datasetViewQuery } from '../queries'
import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'
import ToggleVisibility from './ToggleVisibility'
import DataTableView from './DataTableView'
import DatasetEditor from '../containers/DatasetEditor'
import DatasetModeToggle from '../containers/DatasetModeToggle'
import DatasetColumnChips from './DatasetColumnChips'
import Paper from '@material-ui/core/Paper'
import WarningBanner from './WarningBanner'
import DatasetUploadButton from '../containers/DatasetUploadButton'

// For editing the name without having to go to a form
/* <Typography variant="headline">
  <DatasetNameEditor dataset={dataset} />
  <IconButton aria-label="Chart" onClick={() => navigation.switchMode('chart-editor')}>
    <ChartIcon />
  </IconButton>
</Typography> */

const DATASET_GENERATION_SUBSCRIPTION = gql`
  subscription onDatasetGenerated($id: Int!) {
    datasetGenerated(id: $id) {
      id
      status
      message
    }
  }
`

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  error: {
    color: '#F44336',
    paddingBottom: theme.spacing.unit * 3
  }
});

class DatasetView extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({ switchMode: PropTypes.func }).isRequired,
    id: PropTypes.number,
    classes: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    id: null
  }

  constructor(props) {
    super(props)

    this.state = {
      errors: {}
    }
  }

  subscribeToDatasetGenerated = (subscribeToMore, refetch) => {
    const { id } = this.props

    subscribeToMore({
      document: DATASET_GENERATION_SUBSCRIPTION,
      variables: { id },
      updateQuery: (prev, { subscriptionData }) => {
        const { status, message } = subscriptionData.data.datasetGenerated
        const { errors } = this.state
        if (status === 'failed') {
          this.setState({ errors: Object.assign({}, errors, { [id]: message }) })
        } else {
          this.setState({ errors: Object.assign({}, errors, { [id]: '' }) })
        }
        refetch()
        return prev
      }
    })
  }

  render() {
    const { id, classes, data: { loading, error, refetch, subscribeToMore } } = this.props

    if (loading) return <p>Loading...</p>
    if (error) {
      return (
        <div className={classes.root}>
          <WarningBanner 
            message={error.message}
            header="Something's wrong with your file..."
            advice="Please fix the issue above and try uploading again. If the issue persists, contact us."
          />
          <DatasetUploadButton id={id} />
        </div>
      )
    }

    if (id == null) return <div />

    const { errors } = this.state
    const dataset = this.props.data.dataset[0]
    const displayColumns = dataset.columns
    const selectedColumns = displayColumns.filter(c => c.visible)

    const sampleRows = dataset.samples.map((s) => {
      const record = JSON.parse(s)
      return selectedColumns.map(c => record[c.originalName || c.name])
    })

    const dataExists = selectedColumns.length > 0

    this.subscribeToDatasetGenerated(subscribeToMore, refetch)

    return (
      <div className={classes.root}>
        <DatasetModeToggle dataset={dataset} />
        <DatasetEditor dataset={dataset} dataExists={dataExists} />
        <Typography className={classes.error}>{errors[id]}</Typography>
        <ToggleVisibility visible={dataset.generating}>
          <LinearProgress />
        </ToggleVisibility>
        <ToggleVisibility visible={!dataset.generating && dataExists}>
          <Paper>
            <DataTableView columns={selectedColumns} rows={sampleRows} />
          </Paper>
          <DatasetColumnChips dataset={dataset} columns={displayColumns} />
        </ToggleVisibility>
      </div>
    )
  }
}

const StyledDatasetView = compose(
  withStyles(styles),
  withNavigation,
  graphql(
    datasetViewQuery, {
      options: (props) =>({
        variables: { id: props.id },
        fetchPolicy: 'network-only'
      })
    }
  )
)(DatasetView)

export default StyledDatasetView
