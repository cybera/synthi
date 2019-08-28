import { AuthenticationError } from 'apollo-server-express'

import Base from '../base'
import DefaultQueue from '../../../lib/queue'

import { safeQuery } from '../../../neo4j/connection';
import { canTransform } from '../../util'

import Task from '../task'

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

export default class TransformTask extends Task {
  static async create(properties = {}) {
    const { transformation, ...rest } = properties;
    const task = await super.create({ ...rest, type: 'transform' })
    if (transformation) {
      await task.saveRelation(transformation, '<-[:FOR]-')
    }
    return task;
  }

  async transformation() {
    return this.relatedOne('-[:FOR]->', 'Transformation')
  }

  async run() {
    const user = await this.user()
    const transformation = await this.transformation()

    await transformation.waitForReady()

    const storagePaths = await datasetStorageMap(transformation, 'imported', user)
    const samplePaths = await datasetStorageMap(transformation, 'sample', user)
    const outputDataset = await transformation.outputDataset()
    const owner = await outputDataset.owner()

    const script = await transformation.realScript()

    const taskTransformationInfo = {
      id: transformation.id,
      script,
      output_name: outputDataset.name,
      owner: owner.id,
    }

    await DefaultQueue.sendToWorker({
      task: 'transform',
      // TODO: We really shouldn't need to be passing this in anymore
      ownerName: owner.name,
      taskid: this.uuid,
      state: this.state,
      transformation: taskTransformationInfo,
      storagePaths,
      samplePaths
    })
  }

  async onSuccess(msg) {
    const transformation = await this.transformation();
    const outputDataset = await transformation.outputDataset();
    await outputDataset.handleUpdate(msg.data)
    outputDataset.sendUpdateNotification()
  }

  async onError(msg) {
    const transformation = await this.transformation()
    await transformation.recordError(msg.message)
    const outputDataset = await transformation.outputDataset();
    outputDataset.sendUpdateNotification()
  }
}

Base.ModelFactory.register(TransformTask, 'Task', { type: 'transform' })
