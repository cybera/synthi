import Base from './base'
import logger from '../../config/winston'

export default class Task extends Base {
  static async create(properties = {}) {
    const { user, ...rest } = properties
    const task = await super.create({ ...rest, state: 'initialized' })
    if (user) {
      await task.saveRelation(user, '<-[:SCHEDULED_BY]-')
    }

    return task
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async run(user) {
    throw new Error('run() should be implemented in a subclass of Task')
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async onSuccess(msg) {
    // Do nothing by default
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async onError(msg) {
    // Do nothing by default
  }

  // eslint-disable-next-line no-unused-vars
  async done(msg) {
    logger.debug(`Task ${this.uuid} completed:`)
    logger.debug('%o', msg)

    if (msg.status === 'success') {
      await this.onSuccess(msg)
      this.state = 'done'
      await this.save()
      const nextTask = await this.next()
      if (nextTask) {
        await nextTask.run()
      }
    } else if (msg.status === 'error') {
      logger.error(`Task ${this.uuid} failed with message: ${msg.message}`)
      await this.onError(msg)
    } else {
      logger.error(`Task ${this.uuid} finished with unexpected status: ${msg.status}`)
    }
  }

  async addNext(task) {
    await this.saveRelation(task, '<-[:NEXT]-')
  }

  // Will return null if there is no NEXT task
  async next() {
    return this.relatedOne('-[:NEXT]->', 'Task')
  }

  async user() {
    return this.relatedOne('-[:SCHEDULED_BY]->', 'User')
  }

  async isDone() {
    await this.refresh()
    return this.state === 'done'
  }
}

Base.ModelFactory.register(Task)

Task.label = 'Task'
Task.saveProperties = ['state']
