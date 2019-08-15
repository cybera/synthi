import shortid from 'shortid'

import { fullScriptPath } from '../../lib/util'
import { memberOfOwnerOrg } from '../util'
import Storage from '../../storage'
import Base from './base'
import logger from '../../config/winston'
import { safeQuery } from '../../neo4j/connection';

class Transformation extends Base {
  static async create(properties) {
    const { code, ...rest } = properties
    const transformation = await super.create(rest)

    if (code) {
      await transformation.storeCode(code)
    }

    return transformation
  }

  fullPath() {
    return fullScriptPath(this.script)
  }

  async code() {
    try {
      if (this.script && Storage.exists('scripts', this.script)) {
        const fileString = await Storage.read('scripts', this.script)
        return fileString
      }

      const template = await this.template()
      if (template && template.script && Storage.exists('scripts', template.script)) {
        const fileString = await Storage.read('scripts', template.script)
        return fileString
      }
    } catch (err) {
      logger.error(err)
    }

    return null
  }

  async storeCode(code) {
      if (!this.script) {
        const id = shortid.generate()
        const uniqueFilename = `${id}-${this.name}.py`.replace(/ /g, '_')

        this.script = uniqueFilename
        await this.save()
      }

      const writeStream = Storage.createWriteStream('scripts', this.script)
      writeStream.write(code, 'utf8')
      writeStream.end()
    return new Promise((resolve, reject) => {
      writeStream.on('end', () => resolve({ path: this.script }))
      writeStream.on('error', reject)
    })
    }

  async template() {
    return this.relatedOne('-[:ALIAS_OF]->', Transformation, 'template')
  }

  async outputDataset() {
    const Dataset = Base.ModelFactory.getClass('Dataset')

    return this.relatedOne('-[:OUTPUT]->', Dataset, 'output')
  }

  async owner() {
    const Organization = Base.ModelFactory.getClass('Organization')

    return this.relatedOne('<-[:OWNER]-', Organization, 'owner')
  }

  async canAccess(user) {
    const output = await this.outputDataset()

    if (output) {
      return output.canAccess(user)
    }

    return memberOfOwnerOrg(user, this)
  }
}

Transformation.label = 'Transformation'
Transformation.saveProperties = ['script', 'name']

Base.ModelFactory.register(Transformation)

/*
  Given an array of Transformation IDs, return a mapping
  of fully qualified dataset names to the storage location
  that represents their input and output datasets.
*/
export const datasetStorageMap = async (transformationIds, pathType) => {
  const Organization = Base.ModelFactory.getClass('Organization')

  const query = `
    MATCH (org:Organization)-->(dataset:Dataset)-[ioEdge:INPUT|OUTPUT]-(t:Transformation)
    WHERE ID(t) IN $transformationIds
    RETURN dataset, org, ioEdge
  `
  const results = await safeQuery(query, { transformationIds })
  const inputs = results.map(({ dataset, org, ioEdge }) => ({
    dataset: Base.ModelFactory.derive(dataset),
    org: new Organization(org),
    alias: ioEdge.type === 'INPUT' ? ioEdge.properties.alias : undefined
  }))

  const mapping = {}
  inputs.forEach(({ dataset, org, alias }) => {
    mapping[`${org.name}:${alias || dataset.name}`] = dataset.paths[pathType]
  })

  return mapping
}

export default Transformation
