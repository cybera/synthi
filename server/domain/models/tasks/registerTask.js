import Base from '../base'
import logger from '../../../config/winston'
import DefaultQueue from '../../../lib/queue'

import Task from '../task'

export default class RegisterTask extends Task {
  static async create(properties = {}) {
    const { transformation, ...rest } = properties;
    const task = await super.create({ ...rest, type: 'register' });
    if (transformation) {
      await task.saveRelation(transformation, '<-[:FOR]-');
    }
    return task;
  }

  async transformation() {
    return this.relatedOne('-[:FOR]->', 'Transformation');
  }

  async run() {
    const transformation = await this.transformation();

    await DefaultQueue.sendToWorker({
      task: 'register_transformation',
      taskid: this.uuid,
      transformationScript: transformation.script
    })
  }

  async done(msg) {
    const Dataset = Base.ModelFactory.getClass('Dataset')

    if (msg.status === 'success') {
      logger.warn(`Task ${this.uuid} completed:`);
      logger.warn('%o', msg);
      const user = await this.user()
      const transformation = await this.transformation()
      const outputDataset = await transformation.outputDataset()
      const { inputs, outputs } = msg.data

      const nearestDataset = name => Dataset.getNearestByName(user, name, outputDataset)
      const inputObjs = await Promise.all(inputs.map(nearestDataset))
      const outputObjs = await Promise.all(outputs.map(nearestDataset))

      await outputDataset.registerTransformation(inputObjs, outputObjs)
      outputDataset.sendUpdateNotification();
    }

    // Call super.done regardless of whether or not the task was successful
    // to allow it to handle any sort of failure cleanup that should happen
    // for any task.
    await super.done(msg);
  }
}

Base.ModelFactory.register(RegisterTask, 'Task', { type: 'register' })
