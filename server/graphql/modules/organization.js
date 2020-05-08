import gql from 'graphql-tag'
import { isMember } from '../rules'

export const resolvers = {
}

export const permissions = {
  Organization: {
    members: isMember({ organizationUUID: 'uuid' })
  }
}

export const typeDefs = gql`
  input OrganizationRef {
    id: Int
    uuid: String
    name: String
  }

  type Organization {
    id: Int
    uuid: String!
    name: String!
  }

  extend type Dataset {
    owner: Organization!
  }
`
