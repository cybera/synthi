import React, { useContext } from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'

import { makeStyles } from '@material-ui/styles'

import NavigationContext from '../../contexts/NavigationContext'
import TransformationFilterContext from '../../contexts/TransformationFilterContext'
import TransformationDetail from './TransformationDetail'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(1),
  }
}))

const GET_TRANSFORMATIONS = gql`
  query ListTransformations($org: OrganizationRef!, $filter: TransformationFilter) {
    transformations(org: $org, filter: $filter) {
      name
      uuid
      inputs
      published
    }
  }
`

const TransformationList = () => {
  const navigation = useContext(NavigationContext)
  const filter = useContext(TransformationFilterContext)
  const classes = useStyles()

  const { loading, error, data } = useQuery(GET_TRANSFORMATIONS, {
    variables: {
      org: { uuid: navigation.currentOrg },
      filter: { publishedOnly: filter.publishedOnly }
    },
    fetchPolicy: 'network-only'
  })

  if (loading) return 'Loading...'
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
