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

export const update = async (column, values, tagNames) => {
  // Remove any tags not in the list, add tags that are in the list and haven't yet
  // been related, and set any new values.

  let editTags = ''

  // We only want to add/remove tags if a list of tags has been provided
  if (tagNames) {
    editTags = `
      WITH column
      OPTIONAL MATCH (tag:Tag)-[r:DESCRIBES]->(column)
      WHERE NOT tag.name IN $tagNames
      DELETE r
      WITH column
      MATCH (tag:Tag)
      WHERE tag.name IN $tagNames
      MERGE (tag)-[:DESCRIBES]->(column)
    `
  }

  const editQuery = `
    MATCH (column:Column { uuid: $column.uuid })
    SET column.originalName = COALESCE(column.originalName, column.name),
        column += $values
    ${editTags}
    RETURN column
  `

  await safeQuery(editQuery, { column, tagNames, values })

  const returnQuery = `
    MATCH (column:Column { uuid: $column.uuid })
    RETURN column
  `

  const results = await safeQuery(returnQuery, { column })

  return results.map(row => row.column.properties)[0]
}
