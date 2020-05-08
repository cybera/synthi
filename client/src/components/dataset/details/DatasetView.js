import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import { datasetViewQuery } from '../../../queries'
import ToggleVisibility from '../../layout/ToggleVisibility'
import DatasetEditor from '../editor'
import { UploadButton, DatasetComputeModeButton } from '../editor/buttons'
import NoDataSvg from '../../layout/svg/NoData'
import PanelLoadingState from '../../layout/PanelLoadingState'
import GeneratingProgress from '../layout/GeneratingProgress'
import SubscribedWarningBanner from './SubscribedWarningBanner'
import Preview from './Preview'
import TaskStatus from './TaskStatus'
import { withNavigation } from '../../../contexts/NavigationContext'
import { compose } from '../../../lib/common'

const DATASET_GENERATION_SUBSCRIPTION = gql`
  subscription onDatasetGenerated($uuid: String!) {
    datasetGenerated(uuid: $uuid) {
      uuid
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
    marginTop: theme.spacing(1)
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  error: {
    color: '#F44336',
    paddingBottom: theme.spacing(3)
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
    uuid: PropTypes.string,
    classes: PropTypes.objectOf(PropTypes.any).isRequired,
    dataset: PropTypes.objectOf(PropTypes.any).isRequired,
    subscribeToDatasetGenerated: PropTypes.func.isRequired
  }

  static defaultProps = {
    uuid: null
  }

  constructor(props) {
    super(props)

    this.state = {
      errors: {}
    }
  }

  componentDidMount() {
    const { dataset, navigation, subscribeToDatasetGenerated, uuid } = this.props
    this.unsubscribe = subscribeToDatasetGenerated(({status, message}) => {
      const { errors } = this.state
      if (status === 'error') {
        this.setState({ errors: Object.assign({}, errors, { [uuid]: message }) })
      } else {
        this.setState({ errors: Object.assign({}, errors, { [uuid]: '' }) })
      }
    })

    // TODO: Hack to set correct when following dataset link (dataset-link-hack)
    navigation.setOrg(dataset.owner.uuid)
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const {
      uuid,
      classes,
      dataset
    } = this.props

    if (uuid == null) return <div />

    const { errors } = this.state
    const dataExists = dataset.columns.length > 0

    if (!dataset.computed) {
      // Need to come up with a better check for data existing to account for the possibility of
      // a dataset without column data
      if (dataset.type !== 'csv') {
        const datasetTypeDescription = dataset.type === 'document' ? 'document' : 'dataset'

        return (
          <div className={classes.root}>
            <TaskStatus task={dataset.importTask} />
            <div className={classes.empty}>
              <div className={classes.text}>
                <Typography variant="h5">
                  You've uploaded a
                  {' '}
                  {datasetTypeDescription}
                  {' '}
                  that cannot be previewed right now.
                </Typography>
                <Typography variant="subtitle1" className={classes.subheader}>
                  ...but you can download it or upload a new one!
                </Typography>
                <br />
                <DatasetEditor dataset={dataset} dataExists />
              </div>
            </div>
          </div>
        )
      // Not sure why the linter goes crazy here because there's still a chance that this
      // clause won't match (it's not an else, it's an else if). However, it's probably
      // a good indication that we should break things down further into smaller components.
      // eslint-disable-next-line no-else-return
      } else if (!dataExists && !dataset.importTask) {
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
                  Upload a file containing the underlying data or generate it from 
                  existing datasets.
                </Typography>
              </div>
              <UploadButton dataset={dataset} type={dataset.type} />
              <DatasetComputeModeButton uuid={uuid} />
            </div>
          </div>
        )
      }
    }


    return (
      <div className={classes.root}>
        <TaskStatus task={dataset.importTask} />
        <DatasetEditor dataset={dataset} dataExists={dataExists} />
        <Typography className={classes.error}>{errors[uuid]}</Typography>
        <GeneratingProgress dataset={dataset} />
        <ToggleVisibility visible={!dataset.generating && dataExists}>
          <Preview dataset={dataset} />
        </ToggleVisibility>
      </div>
    )
  }
}

const ConnectedDatasetView = (props) => {
  const { uuid, classes } = props

  return (
    <Query
      query={datasetViewQuery}
      variables={{ uuid }}
    >
      {
        ({ subscribeToMore, error, loading, data, refetch }) => {
          if (error) {
            return (
              <SubscribedWarningBanner
                classes={classes}
                dataset={data.dataset}
                error={error}
                subscribeToDatasetGenerated={(handleStatus) => {
                  return subscribeToMore({
                    document: DATASET_GENERATION_SUBSCRIPTION,
                    variables: { uuid },
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
                  variables: { uuid },
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

// export default withStyles(styles)(ConnectedDatasetView)
export default compose(
  withStyles(styles),
  withNavigation
)(ConnectedDatasetView)
