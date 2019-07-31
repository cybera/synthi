import Base from './base'
import { safeQuery, neo4j } from '../../neo4j/connection'
import { mapValues, isDate } from 'lodash'

class DatasetMetadata extends Base {
  valuesForNeo4J() {
    return mapValues(super.valuesForNeo4J(), (v) => {
      if (isDate(v)) {
        return neo4j.types.DateTime.fromStandardDate(v)
      }
      return v
    })
  }

  beforeSave() {
    if (!this.dateCreated) this.dateCreated = new Date()
    if (!this.dateAdded) this.dateAdded = new Date()
    if (!this.dateUpdated) this.dateUpdated = new Date()

    return super.beforeSave()
  }
}

DatasetMetadata.label = 'DatasetMetadata'
DatasetMetadata.saveProperties = [
  'title',
  'contributor',
  'contact',
  'dateAdded',
  'dateCreated',
  'dateUpdated',
  'updates',
  'updateFrequencyAmount',
  'updateFrequencyUnit',
  'format',
  'description',
  'source',
  'identifier',
  'topic'
]

export default DatasetMetadata
