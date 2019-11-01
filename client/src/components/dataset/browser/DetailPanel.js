import React, { useContext } from 'react'

import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'
import * as R from 'ramda'

import { makeStyles } from '@material-ui/styles'

import { ADILongOpButton } from '../../layout/buttons'

import NavigationContext from '../../../contexts/NavigationContext'
import DatasetFilterContext from '../../../contexts/DatasetFilterContext'
import DatasetDetail from './DatasetDetail'

import PanelLoadingState from '../../layout/PanelLoadingState'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(1),
  },
  loadMoreVisible: {
    width: '100%',
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingBottom: theme.spacing(3),
  },
  loadMoreHidden: {
    width: '100%',
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    visibility: 'hidden',
    height: 0,
    overflow: 'hidden',
  }
}))

const GET_DATASETS = gql`
  query ListDatasets($org: OrganizationRef!, $filter: DatasetFilter, $offset: Int, $limit: Int) {
    listDatasets(org: $org, filter: $filter, offset: $offset, limit: $limit) {
      last
      datasets {
        name
        uuid
        published
        ownerName
        canPublish
        type
        bytes
        metadata {
          description
          dateUpdated
          dateCreated
          format
        }
        columns {
          name
          tags {
            name
          }
        }
      }
    }
  }
`

const DatasetList = () => {
  const navigation = useContext(NavigationContext)
  const { filter } = useContext(DatasetFilterContext)
  const classes = useStyles()

  // Our context includes functions to set the filter options that we
  // can't send to the GraphQL API.
  const notFunction = R.compose(R.not, R.is(Function))
  const options = R.pickBy(notFunction)

  const {
    loading,
    error,
    data,
    fetchMore
  } = useQuery(GET_DATASETS, {
    variables: {
      org: { uuid: navigation.currentOrg },
      filter: options(filter),
      offset: 0,
      limit: 10
    },
    fetchPolicy: 'network-only'
  })

  if (loading) return <PanelLoadingState />
  if (error) return `Error! ${error.message}`

  const { datasets, last } = data.listDatasets

  const handleFetchMore = async () => {
    await fetchMore({
      variables: {
        offset: datasets.length
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev

        // TODO: prev shouldn't be undefined here, but it is after a query is
        // triggered for a Preview panel. Assigning datasets directly in this
        // case seems to work, but it would be better to fix it at the root.
        const prevDatasets = prev ? prev.listDatasets.datasets : datasets
        const moreDatasets = fetchMoreResult.listDatasets.datasets

        const updated = { ...prev, ...fetchMoreResult }
        updated.listDatasets.datasets = [...prevDatasets, ...moreDatasets]
        return updated
      }
    })
  }

  return (
    <div className={classes.root}>
      {datasets.map((dataset) => (
        <DatasetDetail dataset={dataset} key={dataset.uuid} />
      ))}
      <div className={last ? classes.loadMoreHidden : classes.loadMoreVisible}>
        <ADILongOpButton handler={handleFetchMore}>
          Load More...
        </ADILongOpButton>
      </div>
    </div>
  )
}

export default DatasetList
