import crypto from 'crypto'

import Base, { ModelPromise, ModelPromiseNull } from './base'
import User from './user'

import { Indexable } from '../../neo4j/connection'
import logger from '../../config/winston'

export interface Message {
  type: string
  task: string
  taskid: string
  status: string
  message: string
  data?: {[index: string]: any}
}

export default class Task extends Base {
  static readonly label = 'Task'
  static readonly saveProperties = ['state', 'type', 'removeExisting', 'token']

  type: string
  state: string
  removeExisting: boolean
  token: string

  static async create<T extends typeof Base>(this: T, properties: Indexable): ModelPromise<T> {
    const { user, token, ...rest } = properties
    const task = await super.create({ ...rest, state: 'initialized' }) as Task

    if (user) {
      await task.saveRelation(user, '<-[:SCHEDULED_BY]-')
    }

    if (!token) {
      task.token = crypto.randomBytes(64).toString('base64')
      task.save()
    }

    return task as InstanceType<T>
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  async run(): Promise<void> {}

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  async onSuccess(_: Message): Promise<void> {}

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  async onError(_: Message): Promise<void> {}

  async done(msg: Message): Promise<void> {
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

  async addNext(task: Task): Promise<void> {
    await this.saveRelation(task, '<-[:NEXT]-')
  }

  // Will return null if there is no NEXT task
  async next(): Promise<Task|null> {
    return this.relatedOne<typeof Task>('-[:NEXT]->', 'Task')
  }

  async user(): Promise<User|null> {
    return this.relatedOne<typeof User>('-[:SCHEDULED_BY]->', 'User')
  }

  async isDone(): Promise<boolean> {
    await this.refresh()
    return this.state === 'done'
  }
}

Base.ModelFactory.register(Task)
