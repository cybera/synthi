import shortid from 'shortid'

import Base from './base'
import Organization from './organization'
import Transformation from './transformation'
import Column from './column'
import DatasetMetadata from './dataset-metadata'

import Storage from '../../storage'
import { fullDatasetPath, csvFromStream, storeFS } from '../../lib/util'
import DefaultQueue from '../../lib/queue'
import { safeQuery } from '../../neo4j/connection'
import logger from '../../config/winston'

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
    const columns = await this.relatedMany('<-[:BELONGS_TO]-', Column, 'column')
    return columns.sort((c1, c2) => c1.order - c2.order)
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
    logger.info(`looking for samples for: ${this.uuid} / ${this.id}`)
    if (this.path && await Storage.exists('datasets', this.paths.sample)) {
      const readStream = await Storage.createReadStream('datasets', this.paths.sample)
      const csv = await csvFromStream(readStream, 0, 10)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  readStream() {
    logger.info(`Reading ${this.paths.imported}`)
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
      logger.error(err)
    }
  }

  async upload({ stream, filename }) {
    try {
      logger.info(`Uploading: ${filename}`)
      const { path } = await storeFS({ stream, filename: this.paths.original })

      this.path = path
      this.computed = false
      this.originalFilename = filename
      logger.debug('Saving upload info')
      await this.save()
      logger.debug('Triggering import...')
      this.importCSV()
    } catch (e) {
      // TODO: What should we do here?
      logger.error(`Error in upload resolver: ${e.message}`)
    }
  }

  async importCSV(removeExisting=false, options={}) {
    DefaultQueue.sendToWorker({
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
    DefaultQueue.sendToWorker({
      task: 'generate',
      id: this.id,
      uuid: this.uuid,
      paths: this.paths,
      ownerName: owner.name
    })
  }

  // A user can belong to multiple organizations. If you've got access
  // to a dataset, you can save a transformation to it, so we don't need
  // the current user to determine that. However, a dataset is only
  // connected to an owning organization, and we do allow a user to use
  // input datasets from other organizations that they are connected to,
  // so we need to know who's trying to save the transformation to know
  // whether or not we should allow access to those other datasets that
  // cross organizational boundaries.
  //
  // TODO: This should be way more explicit. Ideally, each organization
  // would allow certain users to add a permission for certain other
  // organizations to derive datasets using certain datasets as input.
  // Then we wouldn't need to worry about the current user at this point.
  // We'd simply make sure the existing permissions check out. It would
  // also allow those organizations to effectively revoke future access.
  // However, the cross-organizational aspects aren't particularly pressing
  // at the moment, so we'll leave it this way until we get there.
  async saveInputTransformation(code, user) {
    const query = [`
      MATCH (d:Dataset)
      WHERE ID(d) = toInteger($dataset.id)
      MERGE (t:Transformation)-[:OUTPUT]->(d)
      ON CREATE SET
        t.name = $dataset.name,
        t.inputs = [],
        t.outputs = []
      RETURN t
    `, { dataset: this }]

    const results = await safeQuery(...query)

    if (results[0] && results[0].t) {
      const transformation = new Transformation(results[0].t)
      logger.info('transformation:%o\n', transformation)

      transformation.storeCode(code)

      const saveQuery = [`
        MATCH (t:Transformation)
        WHERE ID(t) = toInteger($transformation.id)
        SET t.script = $transformation.script
      `, { transformation }]

      await safeQuery(...saveQuery)

      if (!this.path) {
        this.path = `${shortid.generate()}-${this.name}.csv`.replace(/ /g, '_')
        const setDefaultPathQuery = [`
          MATCH (d:Dataset)
          WHERE ID(d) = toInteger($dataset.id)
          SET d.path = $dataset.path
        `, { dataset: this }]
        await safeQuery(...setDefaultPathQuery)
      }

      const owner = await this.owner()

      DefaultQueue.sendToWorker({
        task: 'register_transformation',
        id: transformation.id,
        ownerName: owner.name,
        userUuid: user.uuid
      })

      return transformation
    }

    logger.error("Couldn't save transformation")
    return null
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
