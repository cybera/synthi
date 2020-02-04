import Base from '../base'
import runTask from '../../../k8s/k8s'
import Storage from '../../../storage'

import ImportTask from './importTask'
import logger from '../../../config/winston';

export default class ImportDocumentTask extends ImportTask {
  static async create(properties = {}) {
    const task = await super.create({
      ...properties,
      type: 'import_document',
    })

    logger.info(task)
    return task;
  }

  async run() {
    const dataset = await this.dataset();

    const paths = {
      original: Storage.createTempUrl('datasets', dataset.paths.original, 'GET'),
      imported: Storage.createTempUrl('datasets', dataset.paths.imported, 'PUT'),
    }

    await runTask({
      task: this.type,
      taskid: this.uuid,
      token: this.token,
      paths
    })
  }
}

Base.ModelFactory.register(ImportDocumentTask, 'Task', { type: 'import_document' })
