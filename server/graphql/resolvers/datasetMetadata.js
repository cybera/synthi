import { updateDatasetMetadata } from '../../domain/contexts/dataset'

export default {
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
