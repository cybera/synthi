import shortid from 'shortid'
import waitFor from 'p-wait-for'

import { fullScriptPath } from '../../lib/util'
import { memberOfOwnerOrg } from '../util'
import Storage from '../../storage'
import Base, { log, memoize } from './base'
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

  @memoize()
  testing() {
    return 'testing string'
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

  async recordError(error) {
    const query = `
      MATCH (transformation:Transformation { uuid: $transformation.uuid })
      MATCH (transformation)-[:OUTPUT]->(dataset:Dataset)
      SET transformation.error = $error
      SET dataset.generating = false
    `
    await safeQuery(query, { transformation: this, error })
  }
}

Transformation.label = 'Transformation'
Transformation.saveProperties = ['script', 'name', 'published']

Base.ModelFactory.register(Transformation)

export default Transformation
