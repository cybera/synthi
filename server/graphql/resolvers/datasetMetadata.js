import { isOwner } from '../rules'
import { updateDatasetMetadata } from '../../domain/contexts/dataset'

export const resolvers = {
  Dataset: {
    metadata: async dataset => await dataset.metadata() || {}
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    updateDatasetMetadata: async (_, { uuid, metadata }, context) => (
      updateDatasetMetadata(uuid, metadata)
    )
  }
}

export const permissions = {
  Dataset: {
    metadata: isOwner()
  },
  Mutation: {
    updateDatasetMetadata: isOwner()
  }
}
