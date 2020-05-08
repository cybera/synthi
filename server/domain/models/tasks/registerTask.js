import { filter } from 'lodash'

import Base from '../base'
import Storage from '../../../storage'
import runTask from '../../../k8s/k8s'

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

    await runTask({
      task: 'register_transformation',
      taskid: this.uuid,
      token: this.token,
      transformationScript: Storage.createTempUrl('scripts', transformation.script, 'GET')
    })
  }

  async onSuccess(msg) {
    const Dataset = Base.ModelFactory.getClass('Dataset')

    const user = await this.user()
    const transformation = await this.transformation()
    const outputDataset = await transformation.outputDataset()
    let { inputs } = msg.data

    const withNearestDataset = async item => ({
      ...item,
      dataset: await Dataset.getNearestByName(user, item.name, outputDataset)
    })

    inputs = await Promise.all(inputs.map(withNearestDataset))

    const extractName = item => item.name
    const datasetFound = item => !item.dataset
    const notFound = items => filter(items, datasetFound).map(extractName)

    const datasetsNotFound = [...notFound(inputs)]

    if (datasetsNotFound.length > 0) {
      await transformation.recordError(`Could not find: ${datasetsNotFound.join(', ')}`)
    } else {
      await outputDataset.registerTransformation(inputs)
    }

    outputDataset.sendUpdateNotification();
  }

  async onError(msg) {
    const transformation = await this.transformation()
    await transformation.recordError(msg.message)
    const outputDataset = await transformation.outputDataset()
    outputDataset.sendUpdateNotification()
  }
}

Base.ModelFactory.register(RegisterTask, 'Task', { type: 'register' })
