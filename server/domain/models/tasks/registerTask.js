import { filter } from 'lodash'

import Base from '../base'
import DefaultQueue from '../../../lib/queue'
import Storage from '../../../storage'

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

    await DefaultQueue.sendToPythonWorker({
      task: 'register_transformation',
      taskid: this.uuid,
      token: this.token,
      transformationUrl: Storage.createTempUrl('scripts', transformation.script, 'GET')
    })
  }

  async onSuccess(msg) {
    const Dataset = Base.ModelFactory.getClass('Dataset')

    const user = await this.user()
    const transformation = await this.transformation()
    const outputDataset = await transformation.outputDataset()
    const { inputs, outputs } = msg.data

    const nearestDataset = async name => ([
      name, await Dataset.getNearestByName(user, name, outputDataset)
    ])

    const inputPairs = await Promise.all(inputs.map(nearestDataset))
    const outputPairs = await Promise.all(outputs.map(nearestDataset))

    const extractName = pair => pair[0]
    const extractDataset = pair => pair[1]
    const datasetFound = pair => !pair[1]
    const notFound = pairs => filter(pairs, datasetFound).map(extractName)

    const datasetsNotFound = [...notFound(inputPairs), ...notFound(outputPairs)]

    const inputObjs = inputPairs.map(extractDataset)
    const outputObjs = outputPairs.map(extractDataset)

    if (datasetsNotFound.length > 0) {
      await transformation.recordError(`Could not find: ${datasetsNotFound.join(', ')}`)
    } else {
      await outputDataset.registerTransformation(inputObjs, outputObjs)
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
