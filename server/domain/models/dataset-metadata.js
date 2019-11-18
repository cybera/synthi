import { mapValues, isDate } from 'lodash'

import Base from './base'
import { neo4j } from '../../neo4j/connection'

export const TOPICS = [
  'Aboriginal Peoples',
  'Agriculture',
  'Arts, Culture and History',
  'Business and Industry',
  'Economy and Finance',
  'Education - Adult and Continuing',
  'Education - Early Childhood to Grade 12',
  'Education - Post-Secondary and Skills Training',
  'Employment and Labour',
  'Energy and Natural Resources',
  'Environment',
  'Families and Children',
  'Government',
  'Health and Wellness',
  'Housing and Utilities',
  'Immigration and Migration',
  'Interprovincial and International Affairs',
  'Laws and Justice',
  'Persons with Disabilities',
  'Population and Demography',
  'Roads, Driving and Transport',
  'Safety and Emergency Services',
  'Science, Technology and Innovation',
  'Seniors',
  'Society and Communities',
  'Sports and Recreation',
  'Tourism & Parks'
]

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
    if (this.topic) {
      this.topic.forEach((topic) => {
        if (!TOPICS.includes(topic)) {
          throw new Error(`${topic} is not a valid topic`)
        }
      })
    }

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
