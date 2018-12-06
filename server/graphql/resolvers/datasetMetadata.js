import Dataset from '../../domain/models/dataset'

export default {
  Dataset: {
    metadata: async dataset => await dataset.metadata() || {}
  },
  Mutation: {
    updateDatasetMetadata: async (_, { id, metadata }, context) => {
      const dataset = await Dataset.get(id)
      const datasetMetadata = await dataset.metadata()
      datasetMetadata.update(metadata)
      await datasetMetadata.save()
      return metadata
    }
  }
}
