import Base from './base'

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

  async datasetByName(name) {
    const Dataset = Base.ModelFactory.getClass('Dataset')

    return this.relatedOne('-[:OWNER]->', 'Dataset', { name })
  }

  async transformationTemplateByName(name) {
    const Transformation = Base.ModelFactory.getClass('Transformation')

    return this.relatedOne('-[:OWNER]->', 'Transformation', { name })
  }

  async createDataset(initialProperties = {}) {
    const Dataset = Base.ModelFactory.getClass('Dataset')

    let { name } = initialProperties
    if (!name) {
      name = await this.uniqueDefaultDatasetName()
    } else if (await this.datasetByName(name)) {
      throw new Error('Dataset names must be unique within an organization')
    }

    const datasetProperties = {
      type: 'csv',
      computed: false,
      generating: false
    }
    Object.assign(datasetProperties, initialProperties)
    Object.assign(datasetProperties, { name })

    const query = [`
      MATCH (o:Organization { uuid: $organization.uuid })
      CREATE (o)-[:OWNER]->(dataset:Dataset { name: $datasetProperties.name })
      SET dataset += $datasetProperties
      RETURN dataset
    `, { datasetProperties, organization: this }]

    const result = await safeQuery(...query)

    // We have to actually reload this. We can't just derive it from the return results.
    // Why? The package in Neo4J that adds the uuid doesn't execute until the transaction
    // completes. And so the properties returned by the result of the last query won't
    // contain the uuid.
    const dataset = await Dataset.ModelFactory.get(result[0].dataset.identity)
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
    const User = Base.ModelFactory.getClass('User')

    return this.relatedMany('<-[:MEMBER]-', 'User')
  }

  async canCreateDatasets(user) {
    const query = `
      MATCH (user:User { uuid: $user.uuid })-[:MEMBER]->(:Organization { uuid: $organization.uuid })
      RETURN user
    `
    const results = await safeQuery(query, { user, organization: this })

    return results.length === 1
  }

  async transformations() {
    return this.relatedMany('-[:OWNER]->', 'Transformation')
  }

  async canCreateTransformationTemplates(user) {
    // Right now, if a user can create datasets for an organization, they can create
    // standalone transformations for it too.
    return this.canCreateDatasets(user)
  }

  async createTransformationTemplate(name, inputs, code, tags) {
    const Transformation = Base.ModelFactory.getClass('Transformation')

    if (await this.transformationTemplateByName(name)) {
      throw new Error('Reusable transformation names must be unique within an organization')
    }

    const transformation = await Transformation.create({
      name,
      inputs,
      code,
      tags
    })

    await super.saveRelation(transformation, '<-[:OWNER]-')

    return transformation
  }

  async canAccess(user) {
    const orgs = await user.orgs()
    const match = orgs.find(org => org.uuid === this.uuid)
    return typeof match !== 'undefined'
  }

  /* eslint-disable class-methods-use-this */
  allDatasetsQuery() {
    const allDatasetsQuery = new Query('dataset')
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

Base.ModelFactory.register(Organization)

export default Organization
