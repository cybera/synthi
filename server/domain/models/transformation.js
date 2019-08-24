import shortid from 'shortid'
import waitFor from 'p-wait-for'

import { AuthenticationError } from 'apollo-server-express'

import { fullScriptPath } from '../../lib/util'
import { memberOfOwnerOrg, canTransform } from '../util'
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

  async realScript() {
    if (this.script) {
      return this.script
    }

    const template = await this.template()

    if (template && template.script) {
      return template.script
    }

    throw Error(`A transformation should either have its own script or reference 
                 a template transformation with one`)
  }

  async code() {
    try {
      const realScript = await this.realScript()
      if (realScript && Storage.exists('scripts', realScript)) {
        const fileString = await Storage.read('scripts', realScript)
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
    return this.relatedOne('-[:ALIAS_OF]->', 'Transformation')
  }

  async outputDataset() {
    return this.relatedOne('-[:OUTPUT]->', 'Dataset')
  }

  async owner() {
    return this.relatedOne('<-[:OWNER]-', 'Organization')
  }

  async canAccess(user) {
    const output = await this.outputDataset()

    if (output) {
      return output.canAccess(user)
    }

    return memberOfOwnerOrg(user, this)
  }

  async waitForReady() {
    try {
      await waitFor(async () => (await this.refresh()).state === 'ready', { interval: 1000, timeout: 30000 })
    } catch (e) {
      return false
    }

    return true
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
export const datasetStorageMap = async (transformationIds, pathType, user) => {
  const Organization = Base.ModelFactory.getClass('Organization')

  const query = `
    MATCH (org:Organization)-->(dataset:Dataset)-[ioEdge:INPUT|OUTPUT]-(t:Transformation)
    WHERE ID(t) IN $transformationIds
    RETURN dataset, org, ioEdge
  `
  const results = await safeQuery(query, { transformationIds })
  const ioNodes = results.map(({ dataset, org, ioEdge }) => ({
    dataset: Base.ModelFactory.derive(dataset),
    org: new Organization(org),
    alias: ioEdge.type === 'INPUT' ? ioEdge.properties.alias : undefined
  }))

  // This is probably going to be overly restrictive once we start allowing organizations to
  // share an output dataset across organizational boundaries, to which other organizations
  // can apply transformations. In that case, using similar logic as in the canTransform
  // function, and also temporarily storing the actual transformations in the ioNodes mapping
  // above, we could instead remove any transformations with datasets falling in the restricted
  // space. However, since we're only allowing people to do things within organizations they
  // are a part of, we'll take this approach for now.
  if (!(await canTransform(user, ioNodes.map(n => n.dataset.uuid)))) {
    throw new AuthenticationError('Cannot run a transformation without access to all the datasets involved.')
  }

  const mapping = {}
  ioNodes.forEach(({ dataset, org, alias }) => {
    mapping[`${org.name}:${alias || dataset.name}`] = dataset.paths[pathType]
  })

  return mapping
}

export default Transformation
