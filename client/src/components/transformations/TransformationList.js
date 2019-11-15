import React, { useContext } from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'
import * as R from 'ramda'

import { makeStyles } from '@material-ui/styles'

import NavigationContext from '../../contexts/NavigationContext'
import TransformationFilterContext from '../../contexts/TransformationFilterContext'
import TransformationDetail from './TransformationDetail'

import PanelLoadingState from '../layout/PanelLoadingState'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(1),
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
  query ListTransformations($org: OrganizationRef!, $filter: TransformationFilter) {
    transformations(org: $org, filter: $filter) {
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
  }
`

const TransformationList = () => {
  const navigation = useContext(NavigationContext)
  const filter = useContext(TransformationFilterContext)
  const classes = useStyles()

  // Our context includes functions to set the filter options that we
  // can't send to the GraphQL API.
  const notFunction = R.compose(R.not, R.is(Function))
  const options = R.pickBy(notFunction)

  const { loading, error, data } = useQuery(GET_TRANSFORMATIONS, {
    variables: {
      org: { uuid: navigation.currentOrg },
      filter: options(filter)
    },
    fetchPolicy: 'network-only'
  })

  if (loading) return <LoadingSpinner />
  if (error) return `Error! ${error.message}`

  return (
    <div className={classes.root}>
      {data.transformations.map((transformation) => (
        <TransformationDetail transformation={transformation} key={transformation.uuid} />
      ))}
    </div>
  )
}

export default TransformationList
