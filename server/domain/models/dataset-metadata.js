import { mapValues, isDate } from 'lodash'

import Base from './base'
import { neo4j } from '../../neo4j/connection'

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

  async dataset() {
    return this.relatedOne('<-[:HAS_METADATA]-', 'Dataset')
  }

  async isPublished() {
    const dataset = await this.dataset()
    return dataset.published
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

Base.ModelFactory.register(DatasetMetadata)

export default DatasetMetadata
