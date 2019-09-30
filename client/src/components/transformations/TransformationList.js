import React, { useContext } from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'

import NavigationContext from '../../contexts/NavigationContext'
import TransformationDetail from './TransformationDetail'

const GET_TRANSFORMATIONS = gql`
  query ListTransformations($org: OrganizationRef!) {
    transformations(org: $org) {
      name
      uuid
    }
  }
`

const TransformationList = () => {
  const navigation = useContext(NavigationContext)
  const { loading, error, data } = useQuery(GET_TRANSFORMATIONS, {
    variables: { org: { uuid: navigation.currentOrg } }
  })

  if (loading) return 'Loading...'
  if (error) return `Error! ${error.message}`

  return (
    <div>
      {data.transformations.map((transformation) => (
        <TransformationDetail transformation={transformation} />
      ))}
    </div>
  )
}

export default TransformationList
