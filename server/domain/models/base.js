import { safeQuery } from '../../neo4j/connection'

class Base {
  constructor(node) {
    if (!this.constructor.label) {
      throw Error('Subclass requires a .label to be set on the class before use')
    }
    this.id = node.identity
    Object.assign(this, node.properties)

    if (!this.uuid) {
      console.log('Deprecated: All models should have a uuid. Falling back to id.')
      this._identityMatch = `
        MATCH (n:${this.constructor.label})
        WHERE ID(n) == toInteger($id)
      `
    } else {
      this._identityMatch = `
        MATCH (n:${this.constructor.label} { uuid: $uuid })
      `
    }
  }

  async relatedRaw(relation, ModelClass, name) {
    const query = `
      ${this._identityMatch}
      MATCH (n)${relation}(${name}:${ModelClass.label})
      RETURN ${name}
    `
    return safeQuery(query, this)
  }

  async relatedOne(relation, ModelClass, name) {
    const results = await this.relatedRaw(relation, ModelClass, name)
    if (results && results[0]) {
      return new ModelClass(results[0][name])
    }
    return null
  }

  async relatedMany(relation, ModelClass, name) {
    const results = await this.relatedRaw(relation, ModelClass, name)
    if (results) {
      return results.map(result => new ModelClass(result[name]))
    }
    return []
  }
}

export default Base
