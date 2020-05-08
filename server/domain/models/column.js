import Base from './base'
import RedisClient from '../../lib/redisClient'
import { safeQuery } from '../../neo4j/connection'

class Column extends Base {
  async visibleForUser(user) {
    const key = this.__cacheKeyForUser(user)
    const cacheVisible = await RedisClient.hget(key, 'visible')
    // Annoyingly, redis stores our true/false values as strings
    return cacheVisible ? cacheVisible === 'true' : this.order < 5
  }

  async setVisibleForUser(visible, user) {
    const key = `user:${user.uuid}:column:${this.uuid}`
    await RedisClient.hset(key, 'visible', visible)
    return visible
  }

  // TODO: Add tags a basic model class
  async tags() {
    const query = `
      MATCH (c:Column { uuid: $column.uuid })
      MATCH (tag:Tag)-[:DESCRIBES]->(c)
      RETURN tag
    `

    const results = await safeQuery(query, { column: this })

    return results.map(row => row.tag.properties)
  }

  async update(values, tagNames) {
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

    await safeQuery(editQuery, { column: this, tagNames, values })

    const returnQuery = `
      MATCH (column:Column { uuid: $column.uuid })
      RETURN column
    `

    const results = await safeQuery(returnQuery, { column: this })

    return results.map(row => row.column.properties)[0]
  }

  async dataset() {
    return this._dataset || this.relatedOne('-[:BELONGS_TO]->', 'Dataset')
  }

  async canAccess(user) {
    const dataset = await this.dataset()
    return dataset.canAccess(user)
  }

  async isPublished() {
    const dataset = await this.dataset()
    return dataset.published
  }

  __cacheKeyForUser(user) {
    return `user:${user.uuid}:column:${this.uuid}`
  }
}

Column.label = 'Column'
Column.saveProperties = ['name', 'order']

Base.ModelFactory.register(Column)

export default Column
