import AMQP from 'amqplib'
import { pubsub } from '../graphql/pubsub'
import Dataset from '../domain/models/dataset'

const DATASET_UPDATED = 'DATASET_UPDATED'

let pendingDownloads = {}

const startChannel = async (conn, channelName, { durable, noAck }, callback) => {
  const queueName = channelName
  const ch = await conn.createChannel()
  await ch.assertExchange(queueName, 'fanout', { durable })
  await ch.assertQueue(channelName, { durable })
  await ch.bindQueue(queueName, queueName, '')
  await ch.consume(channelName, callback, { noAck })
  return ch
}

const startQueue = async () => {
  const conn = await AMQP.connect('amqp://queue')

  startChannel(conn, 'dataset-status', { durable: false, noAck: true }, (msg) => {
    const msgJSON = JSON.parse(msg.content.toString())
    if (msgJSON.type === 'dataset-updated') {
      Dataset.get(msgJSON.id)
        .then(dataset => dataset.metadata())
        .then((metadata) => {
          metadata.dateUpdated = new Date()
          metadata.save()
        })
        .catch(err => console.log(err))
    }
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

const sendToWorkerQueue = async (msg) => {
  const conn = await AMQP.connect('amqp://queue')
  const ch = await conn.createChannel()
  const ok = await ch.assertQueue('python-worker', { durable: false })
  ch.sendToQueue('python-worker', Buffer.from(JSON.stringify(msg)))
}


const prepareDownload = async (dataset, callback) => {
  // TODO: Pass a unique download ID (have tasks send JSON as argument)
  sendToWorkerQueue({
    task: 'prepare_download',
    id: dataset.id,
    ownerName: dataset.owner.name
  })

  // TODO: Create a unique download ID
  pendingDownloads[`${dataset.id}`] = callback
}

export { startQueue, sendToWorkerQueue, prepareDownload }
