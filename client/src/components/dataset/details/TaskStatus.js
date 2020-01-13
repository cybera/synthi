import React from 'react'
import { useSubscription } from 'react-apollo'
import gql from 'graphql-tag'
import { Alert, AlertTitle } from '@material-ui/lab'

import { taskProptype } from '../../../lib/adiProptypes'

const TASK_UPDATED_SUBSCRIPTION = gql`
  subscription onTaskUpdated($uuid: String) {
    taskUpdated(uuid: $uuid) {
      task {
        uuid
        state
        message
        type
      }
    }
  }
`

const STATE_SEVERITY_MAP = {
  done: 'success',
  initialized: 'info',
  error: 'error',
}

function getSeverity(state) {
  let severity = STATE_SEVERITY_MAP[state]
  if (!severity) {
    severity = 'info'
  }

  return severity
}

function taskTitle({ type, state }) {
  return `${type}: ${state}`
}

export default function TaskStatus({ task }) {
  const { data, loading } = useSubscription(
    TASK_UPDATED_SUBSCRIPTION,
    { variables: { uuid: task ? task.uuid : null } }
  )

  if (!task) {
    return <div />
  }

  let { state, message } = task

  if (!loading && data && data.taskUpdated) {
    ({ state, message } = data.taskUpdated.task)
  }

  return (
    <Alert key={task.uuid} severity={getSeverity(state)}>
      <AlertTitle>
        {taskTitle(task)}
      </AlertTitle>
      {message}
    </Alert>
  )
}

TaskStatus.propTypes = {
  task: taskProptype,
}

TaskStatus.defaultProps = {
  task: null
}
