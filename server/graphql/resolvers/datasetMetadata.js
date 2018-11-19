import { mapValues, isDate } from 'lodash'
import { safeQuery, neo4j } from '../../neo4j/connection'

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
        return result[0].metadata.properties
      }

      return {}
    }
  },
  Mutation: {
    updateDatasetMetadata: async (_, { id, metadata }, context) => {
      const translatedMetadata = mapValues(metadata, (v) => {
        if (isDate(v)) {
          return neo4j.types.DateTime.fromStandardDate(v)
        }
        return v
      })

      const query = `
        MATCH (d:Dataset)
        WHERE ID(d) = toInteger($id)
        MERGE (d)-[:HAS_METADATA]->(metadata:DatasetMetadata)
        SET metadata += $metadata
      `

      await safeQuery(query, { id, metadata: translatedMetadata })

      return metadata
    }
  }
}