import Base from '../base'
import DefaultQueue from '../../../lib/queue'

import ImportTask from './importTask'

export default class ImportCSVTask extends ImportTask {
  static async create(properties = {}) {
    const task = await super.create({
      ...properties,
      type: 'import_csv',
    })

    return task;
  }

  async run() {
    const dataset = await this.dataset();

    const {
      header,
      delimiter,
      customDelimiter,
    } = this

    await DefaultQueue.sendToWorker({
      task: this.type,
      taskid: this.uuid,
      paths: dataset.paths,
      header,
      delimiter,
      customDelimiter,
    })
  }
}

Base.ModelFactory.register(ImportCSVTask, 'Task', { type: 'import_csv' })
