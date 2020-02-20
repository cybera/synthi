import shortid from 'shortid'
import waitFor from 'p-wait-for'

import { memberOfOwnerOrg } from '../util'
import Storage from '../../storage'
import Base, { ModelPromise } from './base'
import logger from '../../config/winston'
import { safeQuery, Indexable } from '../../neo4j/connection';

// Only safe to disable import/no-cycle when importing types
// eslint-disable-next-line import/no-cycle, object-curly-newline
import { User, Tag, Dataset, Organization } from '../models'

class Transformation extends Base {
  static readonly label = 'Transformation'
  static readonly saveProperties = ['script', 'name', 'description', 'published', 'inputs', 'state']

  name: string
  description: string
  script: string
  inputs: [string]
  state: string
  published: boolean

  static async create<T extends typeof Base>(this: T, properties: Indexable): ModelPromise<T> {
    const { code, tags, ...rest } = properties

    const transformation = (await super.create(rest)) as Transformation

    try {
      await transformation.setTags(tags)
    } catch (e) {
      await transformation.delete()
      throw e
    }

    if (code) {
      await transformation.storeCode(code)
    }

    return transformation as InstanceType<T>
  }

  async realScript(): Promise<string> {
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

  async code(): Promise<string|null> {
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

  async storeCode(code: string): Promise<Record<string, string>> {
    if (!this.script) {
      const id = shortid.generate()
      const uniqueFilename = `${id}-${this.name}.py`.replace(/ /g, '_')

      this.script = uniqueFilename
      await this.save()
    }

    const writeStream = Storage.createWriteStream('scripts', this.script)
    writeStream.write(code, 'utf8')
    writeStream.end()
    return new Promise((resolve, reject): void => {
      writeStream.on('success', () => resolve({ path: this.script }))
      writeStream.on('error', reject)
    })
  }

  template(): Promise<Transformation|null> {
    return this.relatedOne<typeof Transformation>('-[:ALIAS_OF]->', 'Transformation')
  }

  outputDataset(): Promise<Dataset|null> {
    return this.relatedOne<typeof Dataset>('-[:OUTPUT]->', 'Dataset')
  }

  async owner(): Promise<Organization> {
    const org = await this.relatedOne<typeof Organization>('<-[:OWNER]-', 'Organization')

    // This should never happen
    if (!org) {
      logger.error(`No owner found for dataset ${this.name} (${this.uuid})!`)
      throw new Error('No owner found')
    }

    return org
  }

  async canAccess(user: User): Promise<boolean> {
    const output = await this.outputDataset()

    if (output) {
      return output.canAccess(user)
    }

    return memberOfOwnerOrg(user, this)
  }

  async isPublished(): Promise<boolean> {
    return this.published
  }

  async waitForReady(): Promise<boolean> {
    try {
      await waitFor(async () => (await this.refresh()).state === 'ready', { interval: 1000, timeout: 100000 })
    } catch (e) {
      return false
    }

    return true
  }

  async recordError(error: string): Promise<void> {
    const query = `
      MATCH (transformation:Transformation { uuid: $transformation.uuid })
      MATCH (transformation)-[:OUTPUT]->(dataset:Dataset)
      SET transformation.error = $error
      SET dataset.generating = false
    `
    await safeQuery(query, { transformation: this, error })
  }

  async ownerName(): Promise<string> {
    const owner = await this.owner()
    return owner ? owner.name : ''
  }

  async fullName(): Promise<string> {
    const ownerName = await this.ownerName()
    return `${ownerName}:${this.name}`
  }

  async canPublish(user: User): Promise<boolean> {
    const orgs = await user.orgs()
    const owner = await this.owner()

    return orgs.some(org => (org.uuid === owner.uuid))
  }

  async virtual(): Promise<boolean> {
    const template = await this.template()
    return template != null
  }

  async tags(): Promise<string[]> {
    const query = `
      MATCH (transformation:Transformation { uuid: $transformation.uuid })
      MATCH (tag:Tag)-[:DESCRIBES]->(transformation)
      RETURN tag
    `

    const results = await safeQuery(query, { transformation: this })

    return results.map(n => n.tag.properties)
  }

  async setTags(tagNames: string[]): Promise<void> {
    // Don't modify tags if they're null/undefined so that graphql args can be
    // blindly passed without worrying whether they were actually set
    if (tagNames == null) {
      return
    }

    const availableTags = (await Tag.all()).map(t => t.name)

    tagNames.forEach((t) => {
      if (!availableTags.includes(t)) {
        throw new Error(`'${t}' is not a valid tag`)
      }
    })

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

Base.ModelFactory.register(Transformation)

export default Transformation
