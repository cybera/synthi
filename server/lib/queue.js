import AMQPManager from 'amqp-connection-manager'
import { pubsub } from '../graphql/pubsub'
import * as ModelFactory from '../domain/models/modelFactory'
import { datasetStorageMap } from '../domain/models/transformation'
import { handleQueueUpdate } from '../domain/models/task'
import logger from '../config/winston'

const DATASET_UPDATED = 'DATASET_UPDATED'

const pendingDownloads = {}

const startChannel = (conn, channelName, { durable, noAck }, callback) => {
  const queueName = channelName
  conn.createChannel({
    json: true,
    setup: async (ch) => {
      await ch.assertExchange(queueName, 'fanout', { durable })
      await ch.assertQueue(channelName, { durable })
      await ch.bindQueue(queueName, queueName, '')
      await ch.consume(channelName, callback, { noAck })
      return ch
    }
  })
}

const startQueue = () => {
  const conn = AMQPManager.connect(['amqp://queue'])

  startChannel(conn, 'dataset-status', { durable: false, noAck: true }, async (msg) => {
    const msgJSON = JSON.parse(msg.content.toString())
    if (msgJSON.type === 'dataset-updated') {
      try {
        logger.info(`Received dataset-status message: Dataset ${msgJSON.id} was updated.`)
        const dataset = await ModelFactory.get(msgJSON.id)
        await handleQueueUpdate(msgJSON)
        const metadata = await dataset.metadata()
        metadata.dateUpdated = new Date()
        await metadata.save()
        logger.debug('Saved metadata')
      } catch (err) {
        logger.error(err)
      }
    }
    logger.debug('Publishing to clients...')
    pubsub.publish(DATASET_UPDATED, { datasetGenerated: msgJSON });
  })

  startChannel(conn, 'download-status', { durable: false, noAck: true }, (msg) => {
    const msgJSON = JSON.parse(msg.content.toString())

    // TODO: Create a unique download ID
    const pendingDownloadCallback = pendingDownloads[`${msgJSON.id}`]
    if (pendingDownloadCallback) {
      pendingDownloads[`${msgJSON.id}`] = undefined
      pendingDownloadCallback()
    }

    logger.info(msgJSON)
  })

  startChannel(conn, 'task-status', { durable: false, noAck: true }, async (msg) => {
    const msgJSON = JSON.parse(msg.content.toString())

    if (msgJSON.type === 'task-updated') {
      if (msgJSON.status === 'done') {
        const task = await ModelFactory.getByUuid(msgJSON.taskid)
        task.done(msgJSON)
      }
    }

    logger.info(msgJSON)
  })

  logger.info(' [*] Waiting for messages. To exit press CTRL+C');

  return conn
}

class AMQP {
  async start() {
    this.conn = startQueue()
    this.worker = await this.conn.createChannel({
      json: true,
      setup: ch => ch.assertQueue('python-worker', { durable: false })
    })
  }

  async sendToWorker(msg) {
    await this.worker.sendToQueue('python-worker', msg)
  }

  async prepareDownload(dataset, user, callback) {
    // TODO: Pass a unique download ID (have tasks send JSON as argument)
    const owner = await dataset.owner()
    const transformations = await dataset.parentTransformations()
    const storagePaths = await datasetStorageMap(transformations.map(t => t.id), 'imported', user)
    const samplePaths = await datasetStorageMap(transformations.map(t => t.id), 'sample', user)

    await this.sendToWorker({
      task: 'prepare_download',
      id: dataset.id,
      ownerName: owner.name,
      transformations,
      storagePaths,
      samplePaths
    })

    // TODO: Create a unique download ID
    pendingDownloads[`${dataset.id}`] = callback
  }

  close() {
    this.conn.close()
  }
}

const DefaultQueue = new AMQP()

export default DefaultQueue
