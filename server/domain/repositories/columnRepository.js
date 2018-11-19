import { safeQuery } from '../../neo4j/connection'

export const tags = async (column) => {
  const query = `
    MATCH (c:Column { uuid: $column.uuid })
    MATCH (tag:Tag)-[:DESCRIBES]->(c)
    RETURN tag
  `

  const results = await safeQuery(query, { column })

  return results.map(row => row.tag.properties)
}

export const update = async (column, newValues, newTags) => {
  // Remove any tags not in the list, add tags that are in the list and haven't yet
  // been related, and set any new values.

  const tagNames = newTags.map(tag => tag.name)

  const cleanupQuery = `
    MATCH (column:Column { uuid: $column.uuid })
    SET column += $newValues
    WITH column
    OPTIONAL MATCH (tag:Tag)-[r:DESCRIBES]->(column)
    WHERE NOT tag.name IN $tagNames
    DELETE r
    WITH column
    OPTIONAL MATCH (tag:Tag)
    WHERE tag.name IN $tagNames
    MERGE (tag)-[:DESCRIBES]->(column)
    RETURN column
  `

  const results = await safeQuery(cleanupQuery, { column, tagNames, newValues })

  return results.map(row => row.column.properties)[0]
}
