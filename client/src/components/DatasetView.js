import React from 'react'
import PropTypes from 'prop-types'
import { graphql, Query } from 'react-apollo'
import gql from 'graphql-tag'

import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

import { datasetViewQuery } from '../queries'
import ToggleVisibility from './ToggleVisibility'
import UploadParsingOptions from './upload-parsing'
import DataTableView from './DataTableView'
import DatasetEditor from '../containers/DatasetEditor'
import DatasetColumnChips from './DatasetColumnChips'
import WarningBanner from './WarningBanner'
import DatasetUploadButton from '../containers/DatasetUploadButton'
import DatasetComputeModeButton from '../containers/DatasetComputeModeButton'
import NoDataSvg from './svg/NoData'
import WarnSvg from './svg/Warn'
import PanelLoadingState from './PanelLoadingState'
import GeneratingProgress from './GeneratingProgress'

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
  },
  empty: {
    textAlign: 'center'
  },
  adviceContainer: {
    marginTop: 40,
  },
  svgContainer: {
    marginTop: 40,
    maxWidth: 300,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  svg: {
    width: '100%',
    display: 'block'
  },
  text: {
    marginBottom: 10
  },
  subheader: {
    maxWidth: 420,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 15
  }
});

class DatasetView extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    classes: PropTypes.objectOf(PropTypes.any).isRequired,
    dataset: PropTypes.objectOf(PropTypes.any).isRequired,
    subscribeToDatasetGenerated: PropTypes.func.isRequired
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

  componentDidMount() {
    const { subscribeToDatasetGenerated, id } = this.props
    this.unsubscribe = subscribeToDatasetGenerated(({status, message}) => {
      const { errors } = this.state
      if (status === 'failed') {
        this.setState({ errors: Object.assign({}, errors, { [id]: message }) })
      } else {
        this.setState({ errors: Object.assign({}, errors, { [id]: '' }) })
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const {
      id,
      classes,
      dataset
    } = this.props

    if (id == null) return <div />

    const { errors } = this.state
    const displayColumns = dataset.columns
    const selectedColumns = displayColumns.filter(c => c.visible)
    const dataExists = selectedColumns.length > 0

    if (!dataExists && !dataset.computed) {
      return (
        <div className={classes.root}>
          <div className={classes.empty}>
            <div className={classes.svgContainer}>
              <NoDataSvg color="#303f9f" className={classes.svg} />
            </div>
            <div className={classes.text}>
              <Typography variant="h5">
                Add some data to your dataset
              </Typography>
              <Typography variant="subtitle1" className={classes.subheader}>
                Upload a CSV file containing the underlying data
                or generate it from existing datasets.
              </Typography>
            </div>
            <DatasetUploadButton id={id} />
            <DatasetComputeModeButton id={id} />
          </div>
        </div>
      )
    }

    const sampleRows = dataset.samples.map((s) => {
      const record = JSON.parse(s)
      return selectedColumns.map(c => record[c.originalName || c.name])
    })

    return (
      <div className={classes.root}>
        <DatasetEditor dataset={dataset} dataExists={dataExists} />
        <Typography className={classes.error}>{errors[id]}</Typography>
        <GeneratingProgress dataset={dataset} />
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

/* eslint-disable react/no-multi-comp */
class SubscribedWarningBanner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: {}
    }
  }

  componentDidMount() {
    const { subscribeToDatasetGenerated, id } = this.props
    this.unsubscribe = subscribeToDatasetGenerated(({status, message}) => {
      const { errors } = this.state
      if (status === 'failed') {
        this.setState({ errors: Object.assign({}, errors, { [id]: message }) })
      } else {
        this.setState({ errors: Object.assign({}, errors, { [id]: '' }) })
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const { classes, id, error } = this.props

    return (
      <div>
        <Grid container columns spacing={24}>
          <Grid item xs={6}>
            <div className={classes.empty}>
              <div className={classes.svgContainer}>
                <WarnSvg color="#303f9f" className={classes.svg} />
              </div>
              <WarningBanner
                message={error.message}
                header="Something's wrong with your file..."
                className={classes.text}
              />
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.adviceContainer}>
              <Typography variant="subtitle1" gutterBottom>
                You can try uploading your file again.
              </Typography>
              <DatasetUploadButton id={id} />
            </div>
            <div className={classes.adviceContainer}>
              <Typography variant="subtitle1" gutterBottom>
                Or you can try providing some more information and rescanning:
              </Typography>
              <UploadParsingOptions id={id} error={error} />
            </div>
          </Grid>
        </Grid>
      </div>
    )
  }
}
/* eslint-enable react/no-multi-comp */

const ConnectedDatasetView = (props) => {
  const { id, classes } = props

  return (
    <Query
      query={datasetViewQuery}
      variables={{ id }}
    >
      {
        ({ subscribeToMore, error, loading, data, refetch }) => {
          if (error) {
            return (
              <SubscribedWarningBanner
                classes={classes}
                id={id}
                error={error}
                subscribeToDatasetGenerated={(handleStatus) => {
                  return subscribeToMore({
                    document: DATASET_GENERATION_SUBSCRIPTION,
                    variables: { id },
                    updateQuery: (prev, { subscriptionData }) => {
                      if (!subscriptionData.data) return prev

                      handleStatus(subscriptionData.data.datasetGenerated)

                      refetch()
                      return prev
                    }
                  })
                }}
              />
            )
          }

          // Not sure why dataset can sometimes be undefined, even when loading is true, as
          // the GraphQL resolver should at least return an empty array. But something's going
          // on to thwart that assumption, so we have to check it here.
          if (loading || !data.dataset) return <PanelLoadingState />

          return (
            <DatasetView
              {...props}
              dataset={data.dataset[0]}
              subscribeToDatasetGenerated={(handleStatus) => {
                return subscribeToMore({
                  document: DATASET_GENERATION_SUBSCRIPTION,
                  variables: { id },
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev

                    handleStatus(subscriptionData.data.datasetGenerated)

                    refetch()
                    return prev
                  }
                })
              }}
            />
          )
        }
      }
    </Query>
  )
}

export default withStyles(styles)(ConnectedDatasetView)
