import lodash from 'lodash'

import { safeQuery, Indexable } from '../../neo4j/connection'
import logger from '../../config/winston'
import * as ModelFactory from './modelFactory'


class Base {
  static readonly ModelFactory = ModelFactory
  static readonly label: string
  static readonly saveProperties: string[]

  id: number
  uuid: string

  constructor(node: Indexable) {
    // TODO: Re-implement this guard
    // if (!this.constructor.label) {
    //   throw Error('Subclass requires a .label to be set on the class before use')
    // }
    // this.__label = this.constructor.label
    // this.__saveProperties = this.constructor.saveProperties
    this.id = node.identity
    Object.assign(this, node.properties)
  }

  static async getByUniqueMatch<T extends typeof Base>(this: T, matchQuery: string, params: object): ModelPromiseNull<T> {
    const model = await ModelFactory.getByUniqueMatch<T>(matchQuery, params)

    if (model === null) {
      return null
    }

    const modelClass = (model.constructor as typeof Base)

    if (this.label !== modelClass.label) {
      throw Error(`Don't call getByUniqueMatch when expecting objects that are
                   not instances of ${modelClass.name} or a subclass of ${modelClass.name}`)
    }

    return model
  }

  static async get<T extends typeof Base>(this: T, id: string|number): ModelPromiseNull<T> {
    const safeId = typeof id === 'string' ? parseInt(id, 10) : id

    const query = `
      MATCH (node:${this.label})
      WHERE ID(node) = toInteger($id)
      RETURN node
    `

    return this.getByUniqueMatch<T>(query, { id: safeId })
  }

  static async getByUuid<T extends typeof Base>(this: T, uuid: string): ModelPromiseNull<T> {
    const query = `
      MATCH (node:${this.label} { uuid: $uuid })
      RETURN node
    `
    return this.getByUniqueMatch(query, { uuid })
  }

  static async all<T extends typeof Base>(this: T): Promise<InstanceType<T>[]> {
    return this.find('', {})
  }

  static async find<T extends typeof Base>(this: T, whereQuery: string, params: object): Promise<InstanceType<T>[]> {
    const query = `
      MATCH (node:${this.label})
      ${whereQuery}
      RETURN node
    `

    const results = await safeQuery(query, params)

    return results.map(r => ModelFactory.derive<T>(r.node))
  }

  static async create<T extends typeof Base>(this: T, properties: Indexable): ModelPromise<T> {
    Object.keys(properties).forEach((k) => {
      if (!this.saveProperties.includes(k)) {
        logger.warn(`Property ${k} not in saveProperties for ${this.name}`)
      }
    })

    const query = `
      CREATE (node:${this.label} { uuid: randomUUID() })
      SET node += $properties
      return node
    `
    const results = await safeQuery(query, { properties })

    return ModelFactory.derive<T>(results[0].node)
  }

  async relatedRaw(relation: string, relatedLabel: string, name: string, relatedProps: Indexable = {}): Promise<Indexable[]> {
    const label = this.classLabel()

    let identityMatch = `
      MATCH (node:${label} { uuid: $node.uuid })
    `

    if (!this.uuid) {
      logger.warn('Deprecated: All models should have a uuid. Falling back to id.')
      identityMatch = `
        MATCH (node:${label})
        WHERE ID(node) = toInteger($node.id)
      `
    }

    // const params = { node: this }
    const params: Indexable = { node: this }

    let relatedPropQueryString = ''
    const relatedPropKeys = Object.keys(relatedProps)
    if (relatedPropKeys.length > 0) {
      const matchStrings = relatedPropKeys.map(k => `${k}: $${name}.${k}`)
      relatedPropQueryString = `{ ${matchStrings.join(',')} }`
      params[name] = relatedProps
    }

    const query = `
      ${identityMatch}
      MATCH (node)${relation}(${name}:${relatedLabel} ${relatedPropQueryString})
      RETURN ${name}
    `

    return safeQuery(query, params)
  }

  async relatedOne<T extends typeof Base>(relation: string, relatedLabel: string, relatedProps = {}): ModelPromiseNull<T> {
    const relatedName = 'relatedNode'
    const results = await this.relatedRaw(relation, relatedLabel, relatedName, relatedProps)
    if (results && results[0]) {
      return ModelFactory.derive<T>(results[0][relatedName])
    }
    return null
  }

  async relatedMany<T extends typeof Base>(relation: string, relatedLabel: string, relatedProps = {}): Promise<InstanceType<T>[]> {
    const relatedName = 'relatedNode'
    const results = await this.relatedRaw(relation, relatedLabel, relatedName, relatedProps)
    if (results) {
      return results.map(result => ModelFactory.derive(result[relatedName]))
    }
    return []
  }

  /* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars,
   @typescript-eslint/require-await, @typescript-eslint/no-explicit-any */
  async canAccess(user: any): Promise<boolean> {
    logger.warn('This should be implemented in a subclass')
    return true
  }
  /* eslint-enable class-methods-use-this, @typescript-eslint/no-unused-vars,
   @typescript-eslint/require-await, @typescript-eslint/no-explicit-any */

  /* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars,
   @typescript-eslint/require-await, @typescript-eslint/no-explicit-any */
   async isPublished(): Promise<boolean> {
    logger.warn('This should be implemented in a subclass')
    return false
  }
  /* eslint-enable class-methods-use-this, @typescript-eslint/no-unused-vars,
   @typescript-eslint/require-await, @typescript-eslint/no-explicit-any */

  update(bulkProperties: Indexable): void {
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
  beforeSave(): { proceed: boolean; message: string } {
    return { proceed: true, message: '' }
  }
  /* eslint-enable class-methods-use-this */

  async save(): Promise<void> {
    const preSave = this.beforeSave()
    if (!preSave.proceed) throw new Error(preSave.message)

    const query = `
      MATCH (node:${this.classLabel()} { uuid: $node.uuid })
      SET node += $values
    `
    const params = { node: this, values: this.valuesForNeo4J() }

    await safeQuery(query, params)
  }

  // When specifying a relation where we want to attach properties to that relation,
  // we need the relationName, from -[relationName:SOME_RELATION]->. Right now, that's
  // all we need it for. In theory, we could parse out the relation string passed in
  // and auto insert the reference, or we could make the user spell out the relation
  // in a more explicit way. If we start to need this in more than a few places, we
  // should rethink this solution.
  async saveRelation(left: Base, relation: string, right = this, relationName: string, relationProps: Indexable): Promise<void> {
    let query = `
      MATCH (right:${right.classLabel()} { uuid: $right.uuid })
      MATCH (left:${left.classLabel()} { uuid: $left.uuid })
      MERGE (left)${relation}(right)
    `

    if (relationName && relationProps) {
      query += `
        SET ${relationName} += $relationProps
      `
    }

    await safeQuery(query, { left, right, relationProps })
  }

  // Can be overridden to specially prepare values for saving to the database
  // This can return a simple object/hash, as long as it has the same keys.
  // Subclass should call the superclass method first to get the subset of
  // properties that are valid to save.
  valuesForNeo4J(): Indexable {
    return lodash.pick(this, this.class().saveProperties)
  }

  async delete(): Promise<void> {
    const query = `
      MATCH (node:${this.classLabel()} { uuid: $node.uuid })
      DETACH DELETE node`
    const params = { node: this }
    await safeQuery(query, params)
  }

  async refresh(): Promise<this> {
    const result = await safeQuery('MATCH (node { uuid: $node.uuid }) RETURN node', { node: this })
    Object.assign(this, result[0].node.properties)
    return this
  }

  class(): typeof Base {
    return this.constructor as typeof Base
  }

  classLabel(): string {
    return this.class().label
  }
}

export type ModelPromise<T extends typeof Base> = Promise<InstanceType<T>>
export type ModelPromiseNull<T extends typeof Base> = Promise<InstanceType<T>|null>
export default Base
