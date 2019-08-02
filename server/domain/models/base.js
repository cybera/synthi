import lodash from 'lodash'

import { safeQuery } from '../../neo4j/connection'
import logger from '../../config/winston'
import * as ModelFactory from './modelFactory'

class Base {
  constructor(node) {
    if (!this.constructor.label) {
      throw Error('Subclass requires a .label to be set on the class before use')
    }
    this.__label = this.constructor.label
    this.__saveProperties = this.constructor.saveProperties
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
      MATCH (node:${this.__label} { uuid: $node.uuid })
    `

    if (!this.uuid) {
      logger.warn('Deprecated: All models should have a uuid. Falling back to id.')
      identityMatch = `
        MATCH (node:${this.__label})
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

  /* eslint-disable class-methods-use-this, no-unused-vars */
  async canAccess(user) {
    logger.warn('This should be implemented in a subclass')
    return true
  }
  /* eslint-enable class-methods-use-this, no-unused-vars */


  update(bulkProperties) {
    Object.assign(this, bulkProperties)
  }

  // Carry out any actions on the object before it is committed
  // to the database. This method should return an object in the
  // following form:
  //
  // { proceed: true }
  // { proceed: false, message: 'Cannot save because...' }
  //
  // The default implementation simply returns { proceed: true }
  /* eslint-disable class-methods-use-this */
  beforeSave() {
    return { proceed: true }
  }
  /* eslint-enable class-methods-use-this */

  async save() {
    const preSave = this.beforeSave()
    if (!preSave.proceed) throw new Error(preSave.message)

    const query = [`
      MATCH (node:${this.__label} { uuid: $node.uuid })
      SET node += $values
    `, { node: this, values: this.valuesForNeo4J() }]

    await safeQuery(...query)
  }

  // Can be overridden to specially prepare values for saving to the database
  // This can return a simple object/hash, as long as it has the same keys.
  // Subclass should call the superclass method first to get the subset of
  // properties that are valid to save.
  valuesForNeo4J() {
    return lodash.pick(this, this.__saveProperties)
  }

  async delete() {
    const query = [`
      MATCH (node:${this.__label} { uuid: $node.uuid })
      DETACH DELETE node`, { node: this }]
    safeQuery(...query)
  }
}

// Set this here to avoid circular dependency issues
Base.ModelFactory = ModelFactory

export default Base
