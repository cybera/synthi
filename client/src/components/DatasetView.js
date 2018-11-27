import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
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
import DatasetColumnChips from './DatasetColumnChips'
import DatasetNameEditor from '../containers/DatasetNameEditor'
import DatasetEditor from '../containers/DatasetEditor'
import DatasetModeToggle from '../containers/DatasetModeToggle'

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
    const { id } = this.props

    return (
      <Query query={datasetViewQuery} variables={{ id }}>
        {({
          data,
          subscribeToMore,
          loading,
          error,
          refetch
        }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <p>Error!</p>

          if (id == null) return <div />

          const { classes, navigation } = this.props
          const { errors } = this.state
          const dataset = data.dataset[0]
          const displayColumns = dataset.columns
          const selectedColumns = displayColumns.filter(c => c.visible)

          const sampleRows = dataset.samples.map((s) => {
            const record = JSON.parse(s)
            return selectedColumns.map(c => record[c.originalName || c.name])
          })

          this.subscribeToDatasetGenerated(subscribeToMore, refetch)

          return (
            <div className={classes.root}>
              <Typography variant="headline">
                <DatasetNameEditor dataset={dataset} />
                <IconButton aria-label="Chart" onClick={() => navigation.switchMode('chart-editor')}>
                  <ChartIcon />
                </IconButton>
                <DatasetModeToggle dataset={dataset} />
              </Typography>
              <DatasetEditor dataset={dataset} />
              <Typography className={classes.error}>{errors[id]}</Typography>
              <DatasetColumnChips dataset={dataset} columns={displayColumns} />
              <ToggleVisibility visible={dataset.generating}>
                <LinearProgress />
              </ToggleVisibility>
              <ToggleVisibility visible={!dataset.generating}>
                <DataTableView columns={selectedColumns} rows={sampleRows} />
              </ToggleVisibility>
            </div>
          )
        }}
      </Query>
    )
  }
}

const StyledDatasetView = compose(
  withStyles(styles),
  withNavigation
)(DatasetView)

export default StyledDatasetView
