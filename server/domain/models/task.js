import { AuthenticationError } from 'apollo-server-express'

import Base from './base'
import logger from '../../config/winston'

import { safeQuery } from '../../neo4j/connection';
import { canTransform } from '../util'

export default class Task extends Base {
  static async create(properties = {}) {
    const { user, ...rest } = properties
    const task = await super.create({ ...rest, state: 'initialized' })
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
    if (msg.status === 'success') {
      this.state = 'done'
      await this.save()
      const nextTask = await this.next()
      if (nextTask) {
        await nextTask.run()
      }
    } else if (msg.status === 'error') {
      logger.error(`Task ${this.uuid} failed with message: ${msg.message}`)
    } else {
      logger.error(`Task ${this.uuid} finished with unexpected status: ${msg.status}`)
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

  async isDone() {
    await this.refresh()
    return this.state === 'done'
  }
}

Base.ModelFactory.register(Task)

Task.label = 'Task'
Task.saveProperties = ['state']

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
