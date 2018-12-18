import AMQPManager from 'amqp-connection-manager'
import { pubsub } from '../graphql/pubsub'
import Dataset from '../domain/models/dataset'

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
      console.log(`Received dataset-status message: Dataset ${msgJSON.id} was updated.`)
      await Dataset.get(msgJSON.id)
        .then(dataset => dataset.metadata())
        .then((metadata) => {
          metadata.dateUpdated = new Date()
          metadata.save()
        }).then(() => {
          console.log('Saved metadata')
        })
        .catch(err => console.log(err))
    }
    console.log('Publishing to clients...')
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

    console.log(msgJSON)
  })

  console.log(' [*] Waiting for messages. To exit press CTRL+C');

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
    this.worker.sendToQueue('python-worker', msg)
  }

  async prepareDownload(dataset, callback) {
    // TODO: Pass a unique download ID (have tasks send JSON as argument)
    const owner = await dataset.owner()

    this.sendToWorker({
      task: 'prepare_download',
      id: dataset.id,
      ownerName: owner.name
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
