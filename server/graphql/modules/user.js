import { allow } from 'graphql-shield'
import gql from 'graphql-tag'

import { isCurrentUser } from '../rules'

import {
  fullUser,
  regenerateAPIKey
} from '../../domain/contexts/user'

export const resolvers = {
  Query: {
    currentUser: (_, params, { user }) => fullUser(user)
  },
  Mutation: {
    regenerateAPIKey: (_, params, { user }) => regenerateAPIKey(user),
    updatePassword: async (_, { password }, { user }) => {
      const u = await fullUser(user)
      await u.hashPassword(password)
      await u.save()
    }
  },
  User: {
    organizations: user => user.orgs()
  }
}

export const permissions = {
  Query: {
    currentUser: allow
  },
  Mutation: {
    // This doesn't need to check the user because the operation explicitly
    // operates on the user in the context (which has already been authenticated).
    // If we passed the user as a parameter in (perhaps to allow an org admin to
    // regenerate API keys for some reason) we'd have to add a real check here.
    regenerateAPIKey: allow,
    updatePassword: allow
  },
  User: {
    apikey: isCurrentUser
  }
}

export const typeDefs = gql`
  type User {
    id: Int
    uuid: String!
    username: String!
    organizations: [Organization]
    apikey: String
  }

  extend type Query {
    currentUser: User
  }

  extend type Mutation {
    regenerateAPIKey: User
    updatePassword(password:String!): Boolean
  }

  extend type Organization {
    members: [User]
  }
`
