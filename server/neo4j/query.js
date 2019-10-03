import { safeQuery } from './connection'
import * as ModelFactory from '../domain/models/modelFactory'
import { reduce, isArray } from 'lodash'

export const SINGLE_NODES = query => result => result[query.returnRefs[0]]
export const NODE_MAP     = _     => result => result

class Query {
  constructor(returnRefOrRefs, resultMapper) {
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
    if (resultMapper) {
      this.resultMapper = resultMapper
    }
    this.parts = []
    this.parameters = {}
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
    strs.push(`RETURN ${this.returnRefs.join(', ')}`)
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
