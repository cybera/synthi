import Base from '../base'
import DefaultQueue from '../../../lib/queue'

import Task from '../task'

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

  async onSuccess(msg) {
    const dataset = await this.dataset();
    await dataset.handleUpdate(msg.data)
    dataset.sendUpdateNotification()
  }
}

Base.ModelFactory.register(ImportCSVTask, 'Task', { type: 'import_csv' })
