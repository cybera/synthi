import Base from '../base'
import DefaultQueue from '../../../lib/queue'

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

    await DefaultQueue.sendToTikaWorker({
      task: this.type,
      taskid: this.uuid,
      token: this.token,
      paths
    })
  }
}

Base.ModelFactory.register(ImportDocumentTask, 'Task', { type: 'import_document' })
