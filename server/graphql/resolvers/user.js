import {
  fullUser,
  regenerateAPIKey
} from '../../domain/contexts/user'

export default {
  Query: {
    currentUser: (_, params, { user }) => fullUser(user)
  },
  Mutation: {
    regenerateAPIKey: (_, params, { user }) => regenerateAPIKey(user)
  },
  User: {
    organizations: user => user.orgs()
  }
}
