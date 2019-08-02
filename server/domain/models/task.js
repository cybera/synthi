import Base from './base'
import logger from '../../config/winston'

export default class Task extends Base {

}

Base.ModelFactory.register(Task)

export async function handleGeneratedInfo(msg) {
  const Dataset = Base.ModelFactory.getClass('Dataset')

  logger.debug('%o', msg)
  const { datasetColumnUpdates } = msg.data

  Object.keys(datasetColumnUpdates).forEach(async (key) => {
    logger.debug('Column update for dataset: %s', key)
    const columns = datasetColumnUpdates[key]
    const dataset = await Dataset.getByFullName(key)
    await dataset.handleColumnUpdate(columns)
  })
}

export async function handleQueueUpdate(msgJSON) {
  const Dataset = Base.ModelFactory.deriveClass('Dataset', { type: 'csv' })

  if (msgJSON.type === 'dataset-updated'
      && msgJSON.task === 'generate'
      && msgJSON.status === 'success') {
    await handleGeneratedInfo(msgJSON)
  } else {
    const dataset = await Dataset.get(msgJSON.id)
    // TODO:
    // 1. We shouldn't just blindly trust this message. One way of dealing with the
    //    trust is to send a token along with the original queue message and expect
    //    that to come back to confirm.
    // 2. Additionally, there should be some sort of Task intermediary. It would
    //    provide an extra level of narrowing the focus, as Datasets could go back
    //    to not caring about events directly from outside like this. It would also
    //    narrow attack vectors to a Task currently unfinished, vs any dataset.
    await dataset.handleQueueUpdate(msgJSON)
  }
}
