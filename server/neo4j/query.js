import { safeQuery } from './connection'
import * as ModelFactory from '../domain/models/modelFactory'
import { reduce, isArray } from 'lodash'

export const SINGLE_NODES = query => result => result[query.returnRefs[0]]
export const NODE_MAP     = _     => result => result

class Query {
  constructor(returnRefOrRefs, options={}) {
    if (isArray(returnRefOrRefs)) {
      this.returnRefs = returnRefOrRefs
      // If we have more than one return reference, we probably want our rows
      // to be maps of the nodes, with keys the same as the references we 
      // passed in.
      this.resultMapper = NODE_MAP
    } else {
      this.returnRefs = [returnRefOrRefs]
      // If we have only a single, non-array of return references, we probably
      // only want a list of single nodes
      this.resultMapper = SINGLE_NODES
    }
    // If we're explicitly specifying a result mapper, use that
    if (options.resultMapper) {
      this.resultMapper = options.resultMapper
    }
    this.parts = []
    this.parameters = {}

    if (options.skip)  this.parameters.skip  = options.skip
    if (options.limit) this.parameters.limit = options.limit
    if (options.order) this.parameters.order = options.order
    if (options.distinct) this.parameters.distinct = options.distinct
  }

  addPart(strOrFunc) {
    this.parts.push(strOrFunc)
  }

  addParameters(paramMap) {
    Object.assign(this.parameters, paramMap)
  }

  toString(params) {
    const strs = this.parts.map((strOrFunc) => {
      if (typeof strOrFunc === 'function') {
        return strOrFunc(params)
      }
      return strOrFunc
    })
    const distinct = params.distinct ? 'DISTINCT' : ''
    strs.push(`RETURN ${distinct} ${this.returnRefs.join(', ')}`)

    if (params.order) strs.push(`ORDER BY ${params.order}`)
    if (params.skip)  strs.push('SKIP $skip')
    if (params.limit) strs.push('LIMIT $limit')

    return strs.join('\n')
  }

  async run(extraParams, resultMapper = this.resultMapper) {
    const finalParameters = {}
    Object.assign(finalParameters, this.parameters)
    Object.assign(finalParameters, extraParams)
    const results = await safeQuery(this.toString(finalParameters), finalParameters)

    return results.map(result => {
      const accumulator = (acc, key) => {
        acc[key] = ModelFactory.derive(result[key])
        return acc
      }
      return reduce(Object.keys(result), accumulator, {})
    }).map(resultMapper(this))
  }
}

export default Query
