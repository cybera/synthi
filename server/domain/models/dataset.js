import Base from './base'
import Organization from './organization'
import Transformation from './transformation'
import Column from './column'
import DatasetMetadata from './dataset-metadata'

import Storage from '../../storage'
import { fullDatasetPath, csvFromStream, storeFS } from '../../lib/util'
import { sendToWorkerQueue } from '../../lib/queue'
import { safeQuery } from '../../neo4j/connection'

class Dataset extends Base {
  static async getByName(organization, name) {
    return organization.datasetByName(name)
  }

  constructor(node) {
    super(node)

    this.paths = {
      original: `${this.uuid}/original.csv`,
      imported: `${this.uuid}/imported.csv`,
      sample: `${this.uuid}/sample.csv`
    }
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
    if (this.path && await Storage.exists('datasets', this.paths.imported)) {
      const readStream = await Storage.createReadStream('datasets', this.paths.imported)
      const csv = await csvFromStream(readStream)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  async samples() {
    console.log(`looking for samples for: ${this.uuid} / ${this.id}`)
    if (this.path && await Storage.exists('datasets', this.paths.sample)) {
      const readStream = await Storage.createReadStream('datasets', this.paths.sample)
      const csv = await csvFromStream(readStream, 0, 10)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  readStream() {
    console.log(`Reading ${this.paths.imported}`)
    return Storage.createReadStream('datasets', this.paths.imported)
  }

  async canAccess(user) {
    const owner = await this.owner()
    const orgs = await user.orgs()
    const match = orgs.find(org => org.uuid === owner.uuid)
    return typeof match !== 'undefined'
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

  async delete() {
    const query = [`
      MATCH (d:Dataset)
      WHERE ID(d) = toInteger($dataset.id)
      OPTIONAL MATCH (d)<--(c:Column)
      OPTIONAL MATCH (t:Transformation)-[:OUTPUT]->(d)
      DETACH DELETE d, c, t`, { dataset: this }]
    safeQuery(...query)

    try {
      Storage.remove('datasets', this.path)
    } catch(err) {
      console.log(err)
    }
  }

  async upload({ stream, filename }) {
    try {
      console.log(`Uploading: ${filename}`)
      const { path } = await storeFS({ stream, filename: this.paths.original })

      this.path = path
      this.computed = false
      this.originalFilename = filename
      console.log('Saving upload info')
      await this.save()
      console.log('Triggering import...')
      this.importCSV()
    } catch (e) {
      // TODO: What should we do here?
      console.log('Error in upload resolver:')
      console.log(e.message)
    }
  }

  async importCSV(removeExisting=false, options={}) {
    sendToWorkerQueue({
      task: 'import_csv',
      uuid: this.uuid,
      paths: this.paths,
      id: this.id,
      removeExisting,
      ...options
    })
  }

  async runTransformation() {
    const owner = await this.owner()
    sendToWorkerQueue({
      task: 'generate',
      id: this.id,
      uuid: this.uuid,
      paths: this.paths,
      ownerName: owner.name
    })
  }

  async metadata() {
    let datasetMetadata = await this.relatedOne('-[:HAS_METADATA]->', DatasetMetadata, 'metadata')
    if (!datasetMetadata) {
      const query = `
        MATCH (dataset:Dataset { uuid: $uuid })
        MERGE (dataset)-[:HAS_METADATA]->(metadata:DatasetMetadata)
        RETURN metadata
      `
      const results = await safeQuery(query, this)
      // Have to re-get after the transaction to ensure a proper uuid
      datasetMetadata = DatasetMetadata.get(results[0].metadata.identity)
    }

    return datasetMetadata
  }
}

Dataset.label = 'Dataset'
Dataset.saveProperties = ['name', 'path', 'computed', 'generating', 'originalFilename']

export default Dataset
