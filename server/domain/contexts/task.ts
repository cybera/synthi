import { AuthenticationError } from 'apollo-server-express'

import Task from '../models/task'

async function updateTask(message: any): Promise<void> {
  if (!message || !message.taskid) {
    throw new Error('Invalid message')
  }

  const task = await Task.getByUuid(message.taskid)

  if (!task) {
    throw new Error(`Task ${message.taskid} not found`)
  }

  // TODO: Invalidate token/check whether task is already complete
  if (message.token && task.token && message.token === task.token) {
    task.done(message)
  } else {
    throw new AuthenticationError('Invalid or missing token')
  }
}

export { updateTask }
