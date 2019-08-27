import Base from './base'
import logger from '../../config/winston'
import DefaultQueue from '../../lib/queue'

import Task from './task'

export default class ImportCSVTask extends Task {
  static async create(properties = {}) {
    const { dataset, options, ...rest } = properties;
    const task = await super.create({
      ...rest,
      ...options,
      type: 'import_csv',
    })

    if (dataset) {
      await task.saveRelation(dataset, '<-[:FOR]-');
    }
    return task;
  }

  async dataset() {
    return this.relatedOne('-[:FOR]->', 'Dataset');
  }

  async run() {
    const dataset = await this.dataset();

    const {
      header,
      delimiter,
      customDelimiter,
    } = this

    await DefaultQueue.sendToWorker({
      task: 'import_csv',
      taskid: this.uuid,
      paths: dataset.paths,
      header,
      delimiter,
      customDelimiter,
    })
  }

  async done(msg) {
    const dataset = await this.dataset();

    if (msg.status === 'success') {
      logger.warn(`Task ${this.uuid} completed:`)
      logger.warn('%o', msg);

      const { columnUpdates } = msg.data;
      if (columnUpdates) {
        await dataset.handleColumnUpdate(columnUpdates)
      } else {
        logger.warn(`No column updates for Dataset: ${dataset.name} (${dataset.uuid})`)
      }
      dataset.sendUpdateNotification()
    }

    // Call super.done regardless of whether or not the task was successful
    // to allow it to handle any sort of failure cleanup that should happen
    // for any task.
    await super.done(msg);
  }
}

Base.ModelFactory.register(ImportCSVTask, 'Task', { type: 'import_csv' })
