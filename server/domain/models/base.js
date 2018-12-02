import { safeQuery } from '../../neo4j/connection'
import lodash from 'lodash'

class Base {
  constructor(node) {
    if (!this.constructor.label) {
      throw Error('Subclass requires a .label to be set on the class before use')
    }
    this.id = node.identity
    Object.assign(this, node.properties)
  }

  static async getByUniqueMatch(matchQuery, params) {
    const results = await safeQuery(matchQuery, params)
    if (!results[0]) {
      return null
    }
    const result = results[0]
    const resultKeys = Object.keys(result)
    if (resultKeys.length !== 1) {
      throw Error('matchQuery for getByUniqueMatch should only have one return node')
    }
    // In the current context, 'this' will be the class (or subclass that called
    // the static 'get' method).
    const nodeAsModel = new this(result[resultKeys[0]])
    return nodeAsModel
  }

  static async get(id) {
    const safeId = parseInt(id, 10)
    const query = `
      MATCH (node:${this.label})
      WHERE ID(node) = toInteger($id)
      RETURN node
    `
    return this.getByUniqueMatch(query, { id: safeId })
  }

  static async getByUuid(uuid) {
    const query = `
      MATCH (node:${this.label} { uuid: $uuid })
      RETURN node
    `
    return this.getByUniqueMatch(query, { uuid })
  }

  async relatedRaw(relation, ModelClass, name, relatedProps = {}) {
    let identityMatch = `
      MATCH (node:${this.constructor.label} { uuid: $node.uuid })
    `

    if (!this.uuid) {
      console.log('Deprecated: All models should have a uuid. Falling back to id.')
      identityMatch = `
        MATCH (node:${this.constructor.label})
        WHERE ID(node) = toInteger($node.id)
      `
    }

    const params = { node: this }

    let relatedPropQueryString = ''
    const relatedPropKeys = Object.keys(relatedProps)
    if (relatedPropKeys.length > 0) {
      const matchStrings = relatedPropKeys.map(k => `${k}: $${name}.${k}`)
      relatedPropQueryString = `{ ${matchStrings.join(',')} }`
      params[name] = relatedProps
    }

    const query = `
      ${identityMatch}
      MATCH (node)${relation}(${name}:${ModelClass.label} ${relatedPropQueryString})
      RETURN ${name}
    `

    return safeQuery(query, params)
  }

  async relatedOne(relation, ModelClass, name, relatedProps = {}) {
    const results = await this.relatedRaw(relation, ModelClass, name, relatedProps)
    if (results && results[0]) {
      return new ModelClass(results[0][name])
    }
    return null
  }

  async relatedMany(relation, ModelClass, name, relatedProps = {}) {
    const results = await this.relatedRaw(relation, ModelClass, name, relatedProps)
    if (results) {
      return results.map(result => new ModelClass(result[name]))
    }
    return []
  }

  canAccess(user) {
    return true
  }

  async save() {
    const saveValues = lodash.pick(this, this.constructor.saveProperties)

    const query = [`
      MATCH (node:${this.constructor.label} { uuid: $node.uuid })
      SET node += $saveValues
    `, { node: this, saveValues }]

    await safeQuery(...query)
  }
}

export default Base
