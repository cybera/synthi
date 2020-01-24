import Base from '../base'
import DefaultQueue from '../../../lib/queue'
import Storage from '../../../storage'

import ImportTask from './importTask'

import runTask from '../../../k8s/k8s'

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

    const paths = {
      original: Storage.createTempUrl('datasets', dataset.paths.original, 'GET'),
      imported: Storage.createTempUrl('datasets', dataset.paths.imported, 'PUT'),
      sample: Storage.createTempUrl('datasets', dataset.paths.sample, 'PUT'),
    }

    const {
      header,
      delimiter,
      customDelimiter,
    } = this

    await runTask({
      task: this.type,
      taskid: this.uuid,
      token: this.token,
      paths,
      header,
      delimiter,
      customDelimiter,
    })
  }
}

Base.ModelFactory.register(ImportCSVTask, 'Task', { type: 'import_csv' })
