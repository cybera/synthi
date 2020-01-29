import gql from 'graphql-tag'
import { pubsub, withFilter } from '../pubsub'
import { TASK_UPDATED } from '../../domain/models/task'
import logger from '../../config/winston'

export const resolvers = {
  Subscription: {
    taskUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([TASK_UPDATED]),
        ({ taskUpdated }, variables) => {
          logger.debug('taskUpdated: %o, subscription: %o', taskUpdated, variables)
          return taskUpdated.task.uuid === variables.uuid
        }
      )
    },
  }

}

export const permissions = {
}

export const typeDefs = gql`
  type Task {
    id: Int
    uuid: String!
    state: String!
    dateUpdated: Date
    type: String
    message: String
  }

  type TaskUpdateMessage {
    task: Task!
  }

  extend type Subscription {
    taskUpdated(uuid: String): TaskUpdateMessage!
  }
`
