import { AuthenticationError } from 'apollo-server-express'

import Base from './base'
import logger from '../../config/winston'

import { safeQuery } from '../../neo4j/connection';
import { canTransform } from '../util'

import DefaultQueue from '../../lib/queue'

export default class Task extends Base {
  static async create(properties = {}) {
    const { user, ...rest } = properties
    const task = await super.create({ ...rest, status: 'initialized' })
    if (user) {
      await task.saveRelation(user, '<-[:SCHEDULED_BY]-')
    }

    return task
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async run(user) {
    throw new Error('run() should be implemented in a subclass of Task')
  }

  // eslint-disable-next-line no-unused-vars
  async done(msg) {
    // TODO: check for actual success before running the next task
    this.status = 'done'
    await this.save()
    const nextTask = await this.next()
    if (nextTask) {
      await nextTask.run()
    }
  }

  async addNext(task) {
    await this.saveRelation(task, '<-[:NEXT]-')
  }

  // Will return null if there is no NEXT task
  async next() {
    return this.relatedOne('-[:NEXT]->', 'Task')
  }

  async user() {
    return this.relatedOne('-[:SCHEDULED_BY]->', 'User')
  }
}

Base.ModelFactory.register(Task)

Task.label = 'Task'
Task.saveProperties = ['status']

/*
  Given an array of Transformation IDs, return a mapping
  of fully qualified dataset names to the storage location
  that represents their input and output datasets.
*/
export const datasetStorageMap = async (transformation, pathType, user) => {
  const Organization = Base.ModelFactory.getClass('Organization')

  const query = `
    MATCH (dataset:Dataset)-[ioEdge:INPUT|OUTPUT]-(t:Transformation { uuid: $transformation.uuid })
    MATCH (org:Organization)-->(dataset)
    RETURN dataset, org, ioEdge
  `
  const results = await safeQuery(query, { transformation })
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

export class TransformTask extends Task {
  static async create(properties = {}) {
    const { transformation, ...rest } = properties
    const task = await super.create({ ...rest, type: 'transform' })
    if (transformation) {
      await task.saveRelation(transformation, '<-[:FOR]-')
    }
    return task
  }

  async transformation() {
    return this.relatedOne('-[:FOR]->', 'Transformation')
  }

  async run() {
    const user = await this.user()
    const transformation = await this.transformation()
    const storagePaths = await datasetStorageMap(transformation, 'imported', user)
    const samplePaths = await datasetStorageMap(transformation, 'sample', user)

    const outputDataset = await transformation.outputDataset()
    const owner = await outputDataset.owner()
    const script = await transformation.realScript()

    const taskTransformationInfo = {
      id: transformation.id,
      script,
      output_name: outputDataset.name,
      owner: owner.id
    }

    await DefaultQueue.sendToWorker({
      task: 'task_test',
      taskid: this.uuid,
      status: this.status,
      transformation: taskTransformationInfo,
      storagePaths,
      samplePaths
    })
  }

  async done(msg) {
    logger.warn(`Task ${this.uuid} completed:`)
    logger.warn('%o', msg)
    await super.done(msg)
  }
}

Base.ModelFactory.register(TransformTask, 'Task', { type: 'transform' })

export async function handleGeneratedInfo(msg) {
  const Dataset = Base.ModelFactory.getClass('Dataset')

  logger.debug('%o', msg)
  const { datasetColumnUpdates } = msg.data

  Object.keys(datasetColumnUpdates).forEach(async (key) => {
    logger.debug('Column update for dataset: %s', key)
    const columns = datasetColumnUpdates[key]
    const dataset = await Dataset.getByFullName(key)
    await dataset.handleColumnUpdate(columns)
  })
}

export async function handleQueueUpdate(msgJSON) {
  const Dataset = Base.ModelFactory.deriveClass('Dataset', { type: 'csv' })

  if (msgJSON.type === 'dataset-updated'
      && msgJSON.task === 'generate'
      && msgJSON.status === 'success') {
    await handleGeneratedInfo(msgJSON)
  } else {
    const dataset = await Dataset.get(msgJSON.id)
    // TODO:
    // 1. We shouldn't just blindly trust this message. One way of dealing with the
    //    trust is to send a token along with the original queue message and expect
    //    that to come back to confirm.
    // 2. Additionally, there should be some sort of Task intermediary. It would
    //    provide an extra level of narrowing the focus, as Datasets could go back
    //    to not caring about events directly from outside like this. It would also
    //    narrow attack vectors to a Task currently unfinished, vs any dataset.
    await dataset.handleQueueUpdate(msgJSON)
  }
}
