import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { withNavigation } from '../../context/NavigationContext'
import Panel from './Panel'

export const datasetQuery = gql`
query ($id: Int) {
  dataset(id: $id) {
    id
    name
  }
}
`

const ConnectedPanel = (props) => {
  const { id, navigation } = props

  return (
    <Query query={datasetQuery} variables={{ id }}>
      {
        ({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <p>Error!</p>

          return <Panel dataset={data.dataset[0]} apikey={navigation.user.apikey} />
        }
      }
    </Query>
  )
}

export default withNavigation(ConnectedPanel)
