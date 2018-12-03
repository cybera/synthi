import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Panel from './Panel'

export const datasetQuery = gql`
query DatasetAndAPIKey ($id: Int) {
  dataset(id: $id) {
    id
    name
  }
  currentUser {
    apikey
  }
}
`

const ConnectedPanel = (props) => {
  const { id } = props

  return (
    <Query query={datasetQuery} variables={{ id }}>
      {
        ({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <p>Error!</p>

          return <Panel dataset={data.dataset[0]} apikey={data.currentUser.apikey} />
        }
      }
    </Query>
  )
}

export default ConnectedPanel
