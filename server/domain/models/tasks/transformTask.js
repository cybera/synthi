import Base from '../base'
import logger from '../../../config/winston'
import DefaultQueue from '../../../lib/queue'

import Task, { datasetStorageMap } from '../task'

export default class TransformTask extends Task {
  static async create(properties = {}) {
    const { transformation, ...rest } = properties;
    const task = await super.create({ ...rest, type: 'transform' });
    if (transformation) {
      await task.saveRelation(transformation, '<-[:FOR]-');
    }
    return task;
  }

  async transformation() {
    return this.relatedOne('-[:FOR]->', 'Transformation');
  }

  async run() {
    const user = await this.user();
    const transformation = await this.transformation();
    const storagePaths = await datasetStorageMap(transformation, 'imported', user);
    const samplePaths = await datasetStorageMap(transformation, 'sample', user);
    const outputDataset = await transformation.outputDataset();
    const owner = await outputDataset.owner();
    const script = await transformation.realScript();
    const taskTransformationInfo = {
      id: transformation.id,
      script,
      output_name: outputDataset.name,
      owner: owner.id
    };
    await DefaultQueue.sendToWorker({
      task: 'transform',
      // TODO: We really shouldn't need to be passing this in anymore
      ownerName: owner.name,
      taskid: this.uuid,
      state: this.state,
      transformation: taskTransformationInfo,
      storagePaths,
      samplePaths
    });
  }

  async done(msg) {
    if (msg.status === 'success') {
      logger.warn(`Task ${this.uuid} completed:`);
      logger.warn('%o', msg);
      const transformation = await this.transformation();
      const outputDataset = await transformation.outputDataset();
      const { columnUpdates } = msg.data;
      if (columnUpdates) {
        await outputDataset.handleColumnUpdate(columnUpdates);
      } else {
        logger.warn(`No column updates for Dataset: ${outputDataset.name} (${outputDataset.uuid})`);
      }
      outputDataset.sendUpdateNotification()
    }
    // Call super.done regardless of whether or not the task was successful
    // to allow it to handle any sort of failure cleanup that should happen
    // for any task.
    await super.done(msg);
  }
}

Base.ModelFactory.register(TransformTask, 'Task', { type: 'transform' })
