import { AuthenticationError } from 'apollo-server-express'

import Task, { Message } from '../models/task'

async function updateTask(message: Message): Promise<void> {
  if (!message || !message.taskid) {
    throw new Error('Invalid message')
  }

  const task = await Task.getByUuid(message.taskid)

  if (!task) {
    throw new Error(`Task ${message.taskid} not found`)
  }

  if (message.data && message.data.token && task.token && message.data.token === task.token) {
    task.done(message)
  } else {
    throw new AuthenticationError('Invalid or missing token')
  }
}
