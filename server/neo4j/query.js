import { safeQuery } from './connection'
import { Dataset, DatasetFactory } from '../domain/models/dataset'

class Query {
  constructor(MainReturnType, mainReturnRef) {
    this.MainReturnType = MainReturnType
    this.mainReturnRef = mainReturnRef
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
    strs.push(`RETURN ${this.mainReturnRef}`)
    return strs.join('\n')
  }

  async run(extraParams) {
    const finalParameters = {}
    Object.assign(finalParameters, this.parameters)
    Object.assign(finalParameters, extraParams)
    const results = await safeQuery(this.toString(finalParameters), finalParameters)

    if (this.MainReturnType.prototype instanceof Dataset) {
      return results.map(result => DatasetFactory.create(result[this.mainReturnRef]))
    } else {
      return results.map(result => new this.MainReturnType(result[this.mainReturnRef]))
    }
  }
}

export default Query
