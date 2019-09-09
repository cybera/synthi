import { updateColumn } from '../../domain/contexts/dataset'

export default {
  Column: {
    tags: column => column.tags(),
    visible: (column, _, context) => column.visibleForUser(context.user)
  },
  Mutation: {
    updateColumn: async (_, { uuid, values, tagNames }, { user }) => (
      updateColumn(uuid, values, tagNames, user)
    )
  }
}
