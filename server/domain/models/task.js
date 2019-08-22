import Base from './base'
import logger from '../../config/winston'

import DefaultQueue from '../../lib/queue'

export default class Task extends Base {
  static async create(properties) {
    return super.create({ ...properties, status: 'initialized' })
  }

  // eslint-disable-next-line class-methods-use-this
  async run() {
    throw new Error('run() should be implemented in a subclass of Task')
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async done(msg) {
    throw new Error('done() should be implemented in a subclass of Task')
  }
}

Base.ModelFactory.register(Task)

Task.label = 'Task'
Task.saveProperties = ['status']

export class TransformTask extends Task {
  static async create(properties) {
    return super.create({ ...properties, type: 'transform' })
  }

  async run() {
    await DefaultQueue.sendToWorker({
      task: 'task_test',
      taskid: this.uuid,
      status: this.status
    })
  }

  async done(msg) {
    logger.warn(`Task ${this.uuid} completed:`)
    logger.warn('%o', msg)
    this.status = 'done'
    this.save()
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
