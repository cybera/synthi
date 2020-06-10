import React, { useContext } from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'
import * as R from 'ramda'

import { makeStyles } from '@material-ui/styles'

import { SynthiLongOpButton } from '../layout/buttons'

import NavigationContext from '../../contexts/NavigationContext'
import TransformationFilterContext from '../../contexts/TransformationFilterContext'
import TransformationDetail from './TransformationDetail'

import PanelLoadingState from '../layout/PanelLoadingState'
import SearchEmptyState from '../dataset/list/search/SearchEmptyState'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(1),
  },
  rootEmpty: {
    paddingTop: '10vh',
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
  },
  loadingSpinner: {
    marginTop: 200
  },
}))

const LoadingSpinner = () => {
  const classes = useStyles()

  return (
    <div className={classes.loadingSpinner}>
      <PanelLoadingState />
    </div>
  )
}

const GET_TRANSFORMATIONS = gql`
  query ListTransformations($org: OrganizationRef!, $filter: TransformationFilter, $offset: Int, $limit: Int) {
    listTransformations(org: $org, filter: $filter, offset: $offset, limit: $limit) {
      transformations {
        name
        uuid
        inputs
        published
        ownerName
        canPublish
        description
        tags {
          name
          uuid
        }
      }
      last
    }
  }
`

const TransformationList = () => {
  const navigation = useContext(NavigationContext)
  const { filter } = useContext(TransformationFilterContext)
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
  } = useQuery(GET_TRANSFORMATIONS, {
    variables: {
      org: { uuid: navigation.currentOrg },
      filter: options(filter),
      offset: 0,
      limit: 10
    },
    fetchPolicy: 'network-only'
  })

  if (loading) return <LoadingSpinner />
  if (error) return `Error! ${error.message}`

  const { transformations, last } = data.listTransformations

  const handleFetchMore = async () => {
    await fetchMore({
      variables: {
        offset: transformations.length
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev

        // TODO: prev shouldn't be undefined here, but it is after a query is
        // triggered for a Preview panel. Assigning datasets directly in this
        // case seems to work, but it would be better to fix it at the root.
        console.log(prev)
        const prevTransformations = prev ? prev.listTransformations.transformations : transformations
        const moreTransformations = fetchMoreResult.listTransformations.transformations

        const updated = { ...prev, ...fetchMoreResult }
        updated.listTransformations.transformations = [
          ...prevTransformations,
          ...moreTransformations
        ]
        return updated
      }
    })
  }

  if (!transformations || transformations.length === 0) {
    return (
      <div className={classes.rootEmpty}>
        <SearchEmptyState text="Try changing your filter options" width="40%" />
      </div>
    )
  }

  return (
    <div className={classes.root}>
      {transformations.map((transformation) => (
        <TransformationDetail transformation={transformation} key={transformation.uuid} />
      ))}
      <div className={last ? classes.loadMoreHidden : classes.loadMoreVisible}>
        <SynthiLongOpButton handler={handleFetchMore}>
          Load More...
        </SynthiLongOpButton>
      </div>
    </div>
  )
}

export default TransformationList
