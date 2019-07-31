import Base from './base'
import Dataset from './dataset'
import User from './user'

import { safeQuery } from '../../neo4j/connection'
import Query from '../../neo4j/query'

class Organization extends Base {
  static async getByName(name) {
    const query = `
      MATCH (node:${this.label} { name: $name })
      RETURN node
    `
    return this.getByUniqueMatch(query, { name })
  }

  async datasets(searchString, searchIndex = 'DefaultDatasetSearchIndex') {
    return this.allDatasetsQuery().run({ organization: this, searchString, searchIndex })
  }

  datasetByName(name) {
    return this.relatedOne('-[:OWNER]->', Dataset, 'dataset', { name })
  }

  async createDataset(initialProperties = {}) {
    let { name } = initialProperties
    if (!name) {
      name = await this.uniqueDefaultDatasetName()
    }

    const datasetProperties = {
      computed: false,
      generating: false
    }
    Object.assign(datasetProperties, initialProperties)
    Object.assign(datasetProperties, { name })

    const query = [`
      MATCH (o:Organization { uuid: $organization.uuid })
      CREATE (o)-[:OWNER]->(d:Dataset { name: $datasetProperties.name })
      SET d += $datasetProperties
      RETURN ID(d) AS id
    `, { datasetProperties, organization: this }]

    const result = await safeQuery(...query)
    const datasetId = result[0].id

    // Normally we shouldn't use the raw id value, but a uuid doesn't get
    // created until the first transaction completes.
    const dataset = await Dataset.get(datasetId)
    // Re-save the dataset to trigger any automatic value setting
    await dataset.save()
    return dataset
  }

  async uniqueDefaultDatasetName() {
    const query = `
      MATCH (d:Dataset)<-[:OWNER]-(o:Organization { uuid: $organization.uuid })
      WHERE d.name STARTS WITH 'New Dataset '
      RETURN d.name AS name
    `
    const names = await safeQuery(query, { organization: this })
    const defaultNameRE = /^New Dataset (\d+)$/
    const extractIndex = (str) => {
      const matches = str.match(defaultNameRE)
      return matches && matches[1] ? parseInt(matches[1], 10) : 0
    }
    const indices = names.map(n => extractIndex(n.name))
    const maxIndex = Math.max(...indices, 0)

    return `New Dataset ${maxIndex + 1}`
  }

  async members() {
    return this.relatedMany('<-[:MEMBER]-', User, 'user')
  }

  async canCreateDatasets(user) {
    const query = `
      MATCH (user:User { uuid: $user.uuid })-[:MEMBER]->(:Organization { uuid: $organization.uuid })
      RETURN user
    `
    const results = await safeQuery(query, { user, organization: this })

    return results.length === 1
  }

  async canAccess(user) {
    const orgs = await user.orgs()
    const match = orgs.find(org => org.uuid === this.uuid)
    return typeof match !== 'undefined'
  }

  /* eslint-disable class-methods-use-this */
  allDatasetsQuery() {
    const allDatasetsQuery = new Query(Dataset, 'dataset')
    allDatasetsQuery.addPart(({ searchString }) => {
      if (searchString) {
        return `
          CALL apoc.index.search($searchIndex, $searchString)
          YIELD node AS searchResult
          MATCH (searchResult)-[:HAS_METADATA|:BELONGS_TO]-(dataset:Dataset)
          MATCH (dataset)<-[:OWNER]-(:Organization { uuid: $organization.uuid })
        `
      }
      return 'MATCH (dataset:Dataset)<-[:OWNER]-(:Organization { uuid: $organization.uuid })'
    })

    return allDatasetsQuery
  }
  /* eslint-enable class-methods-use-this */
}

Organization.label = 'Organization'
Organization.saveProperties = []

export default Organization
