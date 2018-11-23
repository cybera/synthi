import {
  tags as columnTags,
  update
} from '../../domain/repositories/columnRepository'

export default {
  Column: {
    async tags(column) {
      return columnTags(column)
    }
  },
  Mutation: {
    updateColumn: async (_, { uuid, values, tagNames }, context) => {
      return update({ uuid }, values, tagNames)
    }
  }
}
