import shortid from 'shortid'
import waitFor from 'p-wait-for'

import { fullScriptPath } from '../../lib/util'
import { memberOfOwnerOrg } from '../util'
import Storage from '../../storage'
import Base from './base'
import logger from '../../config/winston'
import { safeQuery } from '../../neo4j/connection';

class Transformation extends Base {
  static async create(properties) {
    const { code, tags, ...rest } = properties

    const transformation = await super.create(rest)
    await transformation.setTags(tags)

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
      writeStream.on('success', () => resolve({ path: this.script }))
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

  async recordError(error) {
    const query = `
      MATCH (transformation:Transformation { uuid: $transformation.uuid })
      MATCH (transformation)-[:OUTPUT]->(dataset:Dataset)
      SET transformation.error = $error
      SET dataset.generating = false
    `
    await safeQuery(query, { transformation: this, error })
  }

  async ownerName() {
    const owner = await this.owner()
    return owner.name
  }

  async fullName() {
    const ownerName = await this.ownerName()
    return `${ownerName}:${this.name}`
  }

  async canPublish(user) {
    const orgs = await user.orgs()
    const owner = await this.owner()
    return orgs.some(org => (org.uuid === owner.uuid))
  }

  async virtual() {
    const template = await this.template()
    return template != null
  }

  async tags() {
    const query = `
      MATCH (transformation:Transformation { uuid: $transformation.uuid })
      MATCH (tag:Tag)-[:DESCRIBES]->(transformation)
      RETURN tag
    `

    const results = await safeQuery(query, { transformation: this })

    return results.map(n => n.tag.properties)
  }

  async setTags(tagNames) {
    // Don't modify tags if they're null/undefined so that graphql args can be
    // blindly passed without worrying whether they were actually set
    if (tagNames == null) {
      return
    }

    const query = `
      MATCH (transformation:Transformation { uuid: $transformation.uuid })
      WITH transformation
      OPTIONAL MATCH (tag:Tag)-[r:DESCRIBES]->(transformation)
      WHERE NOT tag.name IN $tagNames
      DELETE r
      WITH transformation
      MATCH (tag:Tag)
      WHERE tag.name in $tagNames
      MERGE (tag)-[:DESCRIBES]->(transformation)
    `

    await safeQuery(query, { transformation: this, tagNames })
  }
}

Transformation.label = 'Transformation'
Transformation.saveProperties = ['script', 'name', 'published', 'inputs', 'state']

Base.ModelFactory.register(Transformation)

export default Transformation
