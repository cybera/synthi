import { Column } from '../../domain/models'

export default {
  Column: {
    async tags(column) {
      return column.tags()
    }
  },
  Mutation: {
    updateColumn: async (_, { uuid, values, tagNames }, context) => {
      const column = await Column.getByUuid(uuid)
      return column.update(values, tagNames)
    }
  }
}
