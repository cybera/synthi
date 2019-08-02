import shortid from 'shortid'

import { fullScriptPath } from '../../lib/util'
import Storage from '../../storage'
import Base from './base'
import logger from '../../config/winston'
import { safeQuery } from '../../neo4j/connection';

class Transformation extends Base {
  constructor(node) {
    super(node)
    if (!this.script) {
      const id = shortid.generate()
      const uniqueFilename = `${id}-${this.name}.py`.replace(/ /g, '_')

      this.script = uniqueFilename
    }
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
    } catch (err) {
      logger.error(err)
    }

    return null
  }

  storeCode(code) {
    try {
      const writeStream = Storage.createWriteStream('scripts', this.script)
      writeStream.write(code, 'utf8')
      writeStream.end()
    } catch (err) {
      logger.error(err)
    }
  }

  async outputDataset() {
    const Dataset = Base.ModelFactory.getClass('Dataset')

    return this.relatedOne('-[:OUTPUT]->', Dataset, 'output')
  }

  async canAccess(user) {
    const output = await this.outputDataset()
    return output.canAccess(user)
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
    MATCH (org:Organization)-->(dataset:Dataset)-[:INPUT|OUTPUT]-(t:Transformation)
    WHERE ID(t) IN $transformationIds
    RETURN dataset, org
  `
  const results = await safeQuery(query, { transformationIds })
  const inputs = results.map(r => ({
    dataset: Base.ModelFactory.derive(r.dataset),
    org: new Organization(r.org)
  }))

  const mapping = {}
  inputs.forEach((input) => {
    mapping[`${input.org.name}:${input.dataset.name}`] = input.dataset.paths[pathType]
  })

  return mapping
}

export default Transformation
