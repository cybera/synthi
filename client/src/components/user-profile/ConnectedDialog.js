import React from 'react'

import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import UserProfileDialog from './Dialog'

export const currentUserQuery = gql`
  query {
    currentUser {
      id
      username
      apikey
    }
  }
`

export const regenerateAPIKeyMutation = gql`
  mutation {
    regenerateAPIKey {
      id
      username
      apikey
    }
  }
`

const ConnectedDialog = (props) => {
  return (
    <Mutation mutation={regenerateAPIKeyMutation}>
      { 
        mutation => (
          <Query query={currentUserQuery}>
            {
              ({ loading, error, data }) => {
                if (loading) return null
                if (error) return null
                return (
                  <UserProfileDialog
                    user={data.currentUser}
                    regenerateAPIKey={mutation}
                    {...props}
                  />
                )
              }
            }
          </Query>
        )
      }
    </Mutation>
  )
}

export default ConnectedDialog