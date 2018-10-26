import { safeQuery } from '../../neo4j/connection'

export default {
  Dataset: {
    async metadata(dataset) {
      const { id } = dataset

      const query = `
        MATCH (d:Dataset)
        WHERE ID(d) = toInteger($id)
        OPTIONAL MATCH (d)-[:HAS_METADATA]->(metadata:DatasetMetadata)
        RETURN metadata
      `

      const result = await safeQuery(query, { id })

      if (result[0].metadata) {
        console.log(result[0].metadata.properties)
        return result[0].metadata.properties
      }

      return {}
    }
  },
  Mutation: {
    updateDatasetMetadata: async (_, { id, metadata }, context) => {
      console.log('New Metadata')
      console.log(metadata)
      console.log('-----------------')
      const query = `
        MATCH (d:Dataset)
        WHERE ID(d) = toInteger($id)
        MERGE (d)-[:HAS_METADATA]->(metadata:DatasetMetadata)
        SET metadata = $metadata
      `

      await safeQuery(query, { id, metadata })

      return metadata
    }
  }
}