import shortid from 'shortid'
import waitFor from 'p-wait-for'

import withNext from '../../lib/withNext'

import Base from './base'

import Storage from '../../storage'
import { fullDatasetPath, storeFS } from '../../lib/util'

import { pubsub } from '../../graphql/pubsub'
import { safeQuery } from '../../neo4j/connection'
import logger from '../../config/winston'
import { memberOfOwnerOrg } from '../util'

const DATASET_UPDATED = 'DATASET_UPDATED'

class Dataset extends Base {
  // Given a particular user and name reference for a dataset,
  // get an accessible dataset following rules for name resolution
  // across organizations and ensuring that the user has access to
  // that dataset. If no dataset can be found that the user can
  // access, we'll return null.
  static async getNearestByName(user, name, nearDataset) {
    // There may be no org name, in which case we assume the datasetName.
    // Assigning in reverse handles the case where there is no ':' properly.
    const [datasetName, orgName] = name.split(':').reverse()
    const orgByName = 'MATCH (org:Organization { name: $orgName })'
    const orgByDataset = `
      MATCH (nearDataset:Dataset { uuid: $nearDataset.uuid })
      MATCH (org:Organization)-[:OWNER]->(nearDataset)
    `
    const orgFinder = orgName ? orgByName : orgByDataset

    const query = `
      ${orgFinder}
      MATCH (user:User { uuid: $user.uuid })
      MATCH (user)-[:MEMBER]->(org)
      MATCH (org)-[:OWNER]->(dataset:Dataset { name: $datasetName })
      RETURN dataset
    `

    const params = {
      user,
      nearDataset,
      orgName,
      datasetName
    }

    const results = await safeQuery(query, params)
    if (results.length > 0) {
      return Base.ModelFactory.derive(results[0].dataset)
    }

    return null
  }

  static async getByName(organization, name) {
    return organization.datasetByName(name)
  }

  static async getByFullName(fullName) {
    const Organization = Base.ModelFactory.getClass('Organization')

    const parts = fullName.split(':')

    if (parts.length !== 2) {
      throw Error('This function should only be used with fully qualified dataset names')
    }

    const [orgName, datasetName] = parts

    const organization = await Organization.getByName(orgName)
    return organization.datasetByName(datasetName)
  }

  constructor(node) {
    super(node)
    this.paths = {
    }
  }

  async owner() {
    return this.relatedOne('<-[:OWNER]-', 'Organization')
  }

  async inputTransformation() {
    return this.relatedOne('<-[:OUTPUT]-', 'Transformation')
  }

  fullPath() {
    return fullDatasetPath(this.path)
  }

  readStream(type = 'imported') {
    logger.info(`Reading ${this.paths.imported}`)
    return Storage.createReadStream('datasets', this.paths[type])
  }

  async download(req, res, type = 'imported') {
    if (await this.canAccess(req.user)) {
      res.attachment(this.downloadName())

      const lastPrepTask = this.computed ? (await this.runTransformation(req.user)) : undefined

      const downloadReady = async () => {
        const storageReady = await Storage.exists('datasets', this.paths.imported)
        const tasksRun = lastPrepTask ? (await lastPrepTask.isDone()) : true

        return storageReady && tasksRun
      }

      try {
        await waitFor(downloadReady, { interval: 2000, timeout: 30000 })
      } catch (e) {
        logger.error(`Error waiting for download preparation on dataset ${this.debugSummary()}:`)
        logger.error(e)
      }

      this.readStream(type).pipe(res)
    } else {
      res.status(404).send('Not found')
    }
  }

  async canAccess(user) {
    return memberOfOwnerOrg(user, this)
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
      OPTIONAL MATCH (t:Transformation)-[:OUTPUT]->(d)
      DETACH DELETE d, t`, { dataset: this }]
    await safeQuery(...query)

    try {
      await this.deleteStorage()
    } catch (err) {
      logger.error(err)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async deleteStorage() {
    // Do nothing by default
  }

  async upload({ stream, filename, mimetype }) {
    try {
      logger.info(`Uploading: ${filename}`)
      const { path } = await storeFS({ stream, filename: this.paths.original })

      this.path = path
      this.computed = false
      this.originalFilename = filename
      this.mimetype = mimetype
      logger.debug('Saving upload info')
      await this.save()
      logger.debug('Triggering import...')
      await this.import()
    } catch (e) {
      // TODO: What should we do here?
      logger.error(`Error in upload resolver: ${e.message}`)
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async import(removeExisting = false, options = {}) {
    // Do nothing by default
  }

  async runTransformation(user) {
    const TransformTask = Base.ModelFactory.getClass('TransformTask')

    const transformations = await this.transformationChain()
    const tasks = await Promise.all(transformations.map(async transformation => (
      TransformTask.create({ transformation, user })
    )))

    if (tasks.length > 1) {
      await Promise.all(withNext(tasks, (task, nextTask) => task.addNext(nextTask)))
    }

    if (tasks.length > 0) {
      await tasks[0].run()
    }

    return tasks[tasks.length - 1]
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
    const Transformation = Base.ModelFactory.getClass('Transformation')

    const query = [`
      MATCH (d:Dataset)
      WHERE ID(d) = toInteger($dataset.id)
      MERGE (t:Transformation)-[:OUTPUT]->(d)
      ON CREATE SET
        t.name = $dataset.name,
        t.inputs = [],
        t.outputs = [],
        t.uuid = randomUUID(),
        t.state = 'registering',
        d.computed = true
      RETURN t
    `, { dataset: this }]

    const results = await safeQuery(...query)

    if (results[0] && results[0].t) {
      const transformation = new Transformation(results[0].t)
      logger.info('transformation:%o\n', transformation)

      await transformation.storeCode(code)

      if (!this.path) {
        this.path = `${shortid.generate()}-${this.name}.${this.type}`.replace(/ /g, '_')
        const setDefaultPathQuery = [`
          MATCH (d:Dataset)
          WHERE ID(d) = toInteger($dataset.id)
          SET d.path = $dataset.path
        `, { dataset: this }]
        await safeQuery(...setDefaultPathQuery)
      }

      // RegisterTask
      const RegisterTask = Base.ModelFactory.getClass('RegisterTask')
      const registerTask = await RegisterTask.create({ transformation, user })
      await registerTask.run()

      return transformation
    }

    logger.error("Couldn't save transformation")
    return null
  }

  async saveInputTransformationRef(template, inputs) {
    const Transformation = Base.ModelFactory.getClass('Transformation')
    let transformation = await this.inputTransformation()
    if (transformation) {
      transformation.delete()
    } else {
      this.computed = true

      await this.save()  
    }

    transformation = await Transformation.create({
      name: this.name,
      outputs: [],
      inputs: [],
      virtual: true,
      // We don't have to put these through a registration operation to figure out
      // inputs, so they're ready right away.
      state: 'ready'
    })

    await super.saveRelation(transformation, '-[:OUTPUT]->')
    await super.saveRelation(transformation, '-[:ALIAS_OF]->', template)

    await Promise.all(inputs.map((input) => {
      const { alias, dataset } = input
      return super.saveRelation(transformation, '<-[r:INPUT]-', dataset, 'r', { alias })
    }))

    return transformation
  }

  async metadata() {
    const DatasetMetadata = Base.ModelFactory.getClass('DatasetMetadata')

    let datasetMetadata = await this.relatedOne('-[:HAS_METADATA]->', 'DatasetMetadata')
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

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async handleUpdate(msg) {
    // Do nothing
  }

  async registerTransformation(inputs, outputs) {
    if (outputs.length > 0) {
      throw new Error('Specifying outputs other than the original dataset not supported')
    }

    const baseQuery = `
      MATCH (outputDataset:Dataset { uuid: $dataset.uuid })
      MATCH (transformation:Transformation)-[:OUTPUT]->(outputDataset)
    `

    const deleteOldQuery = `
      ${baseQuery}
      MATCH (:Dataset)-[currentInput:INPUT]->(transformation)
      DELETE currentInput
    `
    await safeQuery(deleteOldQuery, { dataset: this })

    const inputsQuery = `
      ${baseQuery}
      UNWIND $inputUuids AS inputUuid
      MATCH (inputDataset:Dataset { uuid: inputUuid })
      MERGE (inputDataset)-[:INPUT]->(transformation)
    `
    const inputUuids = inputs.map(input => input.uuid)
    await safeQuery(inputsQuery, { dataset: this, inputUuids })

    const transformationReadyQuery = `
      MATCH (:Dataset { uuid: $dataset.uuid })<-[:OUTPUT]-(t:Transformation)
      SET t.state = 'ready'
      REMOVE t.error
    `
    await safeQuery(transformationReadyQuery, { dataset: this })
    await this.touch()
  }

  async transformationChain() {
    const query = `
      MATCH full_path = (output:Dataset)<-[*]-(last)
      WHERE ID(output) = toInteger($output_id) AND
            ((last:Dataset AND last.computed = false) OR last:Transformation)
      WITH full_path, output
      MATCH (t:Transformation)
      MATCH individual_path = (output)<-[*]-(t)
      WHERE t IN nodes(full_path)
      WITH DISTINCT(individual_path), t
      MATCH (t)-[:OUTPUT]->(individual_output:Dataset)<-[:OWNER]-(o:Organization)
      RETURN
        t AS transformation,
        length(individual_path) AS distance
      ORDER BY distance DESC
    `

    const results = await safeQuery(query, { output_id: this.id })

    return Promise.all(results.map(r => Base.ModelFactory.derive(r.transformation)))
  }

  // eslint-disable-next-line class-methods-use-this
  async columns() {
    return []
  }

  // eslint-disable-next-line class-methods-use-this
  async samples() {
    return []
  }

  downloadName() {
    return `${this.originalFilename}`
  }

  debugSummary() {
    return `${this.name} (${this.uuid})`
  }

  sendUpdateNotification() {
    logger.debug('Publishing to clients...')
    pubsub.publish(DATASET_UPDATED, { datasetGenerated: { uuid: this.uuid, status: 'success', message: '' } });
  }

  // Record a new dateUpdated on the metadata for the current time
  async touch() {
    const metadata = await this.metadata()
    metadata.dateUpdated = new Date()
    await metadata.save()
  }

  async updateMetadata(metadata) {
    const datasetMetadata = await this.metadata()
    datasetMetadata.update(metadata)
    await datasetMetadata.save()
  }
}

Dataset.label = 'Dataset'
Dataset.saveProperties = ['name', 'type', 'path', 'computed', 'generating', 'originalFilename', 'mimetype']

Base.ModelFactory.register(Dataset)

export default Dataset
