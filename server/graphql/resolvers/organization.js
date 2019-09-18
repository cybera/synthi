import { isMember } from '../rules'

export const resolvers = {
}

export const permissions = {
  Organization: {
    members: isMember({ organizationUUID: 'uuid' })
  }
}
