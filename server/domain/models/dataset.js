import Base from './base'
import Organization from './organization'
import Transformation from './transformation'
import Column from './column'

import Storage from '../../storage'
import { fullDatasetPath, csvFromStream } from '../../lib/util'
import canAccessDataset from '../policies/canAccessDataset'
import { safeQuery } from '../../neo4j/connection'

class Dataset extends Base {
  static async getByName(organization, name) {
    return organization.datasetByName(name)
  }

  constructor(node) {
    super(node)
  }

  async columns() {
    return this.relatedMany('<-[:BELONGS_TO]-', Column, 'column')
  }

  async owner() {
    return this.relatedOne('<-[:OWNER]-', Organization, 'owner')
  }

  async inputTransformation() {
    return this.relatedOne('<-[:OUTPUT]-', Transformation, 'transformation')
  }

  fullPath() {
    return fullDatasetPath(this.path)
  }

  async rows() {
    if (this.path && await Storage.exists('datasets', this.path)) {
      const readStream = await Storage.createReadStream('datasets', this.path)
      const csv = await csvFromStream(readStream)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  async samples() {
    if (this.path && await Storage.exists('datasets', this.path)) {
      const readStream = await Storage.createReadStream('datasets', this.path)
      const csv = await csvFromStream(readStream, 0, 10)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  readStream() {
    return Storage.createReadStream('datasets', this.path)
  }

  deleteDataset() {
    try {
      Storage.remove('datasets', this.path)
    } catch(err) {
      console.log(err)
    }
  }

  canAccess(user) {
    return canAccessDataset(user, this)
  }

  async save() {
    if (!(await this.isUnique())) {
      throw new Error('Name must be unique')
    }

    super.save()
  }

  async isUnique() {
    const owner = await this.owner()
    const query = [`
      MATCH (dataset:Dataset { name: $dataset.name })<-[:OWNER]-(:Organization { uuid: $owner.uuid })
      WHERE dataset.uuid <> $dataset.uuid
      RETURN dataset`, { dataset: this, owner }]

    const results = await safeQuery(...query)

    return results.length === 0
  }

  async connections() {
    const query = `MATCH (root:Dataset { uuid: $uuid })
    OPTIONAL MATCH p=(root)<-[*]-(a:Dataset)
    WITH relationships(p) AS r, root
    UNWIND CASE WHEN size(r) IS NULL THEN [NULL] ELSE r END AS rs
    WITH CASE 
      WHEN rs IS NULL THEN {original:ID(root), name:root.name, kind:root.kind}
        ELSE {start:{
              node: ID(startNode(rs)), 
              kind: labels(startNode(rs))[0],
              name: startNode(rs).name,
              inputs: startNode(rs).inputs,
              outputs: startNode(rs).outputs
              }, 
              type: type(rs), 
              end:{
                node: ID(endNode(rs)), 
                kind: labels(endNode(rs))[0],
                name:endNode(rs).name,
                inputs: endNode(rs).inputs,
                outputs: endNode(rs).outputs

              }}
    END AS connection
    RETURN connection`

    const connections = await safeQuery(query, this)
    return JSON.stringify(connections)
  }
}

Dataset.label = 'Dataset'
Dataset.saveProperties = ['name', 'path', 'computed', 'generating']

export default Dataset
