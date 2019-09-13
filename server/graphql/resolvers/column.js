import { isOwner } from '../rules'
import { updateColumn } from '../../domain/contexts/dataset'

export const resolvers = {
  Column: {
    tags: column => column.tags(),
    visible: (column, _, { user }) => column.visibleForUser(user)
  },
  Mutation: {
    updateColumn: async (_, { uuid, values, tagNames }) => (
      updateColumn(uuid, values, tagNames)
    )
  }
}

export const permissions = {
  Column: {
    '*': isOwner()
  },
  Mutation: {
    updateColumn: isOwner()
  }
}
