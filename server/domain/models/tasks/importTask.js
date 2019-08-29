import Base from '../base'

import Task from '../task'

export default class ImportTask extends Task {
  static async create(properties = {}) {
    const { dataset, options, type, queue, ...rest } = properties;
    const task = await super.create({
      type,
      queue,
      ...rest,
      ...options,
    })

    if (dataset) {
      await task.saveRelation(dataset, '<-[:FOR]-');
    }
    return task;
  }

  async dataset() {
    return this.relatedOne('-[:FOR]->', 'Dataset');
  }

  async onSuccess(msg) {
    const dataset = await this.dataset();
    await dataset.handleUpdate(msg.data)
    dataset.sendUpdateNotification()
  }
}

Base.ModelFactory.register(ImportTask, 'Task')
