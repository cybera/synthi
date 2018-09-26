import { pubsub } from '../graphql/pubsub'
import AMQP from 'amqplib'

const DATASET_UPDATED = 'DATASET_UPDATED'

function startDatasetStatusConsumer() {
  return AMQP.connect('amqp://queue').then((conn) => {
    return conn.createChannel().then(async (ch) => {
      let queueName = 'dataset-status';

      await ch.assertExchange(queueName, 'fanout', {durable: false})
      await ch.assertQueue('dataset-status', {durable: false})
      await ch.bindQueue(queueName, queueName, '')
      await ch.consume('dataset-status', (msg) => {
        const msgJSON = JSON.parse(msg.content.toString())
        pubsub.publish(DATASET_UPDATED, { datasetGenerated: msgJSON });
        // console.log(" [x] Received '%s'", msgJSON);
      }, {noAck: true})
      
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
  }).catch(console.warn)
}

async function sendToWorkerQueue(msg) {
  const conn = await AMQP.connect('amqp://queue')
  const ch = await conn.createChannel()
  const ok = await ch.assertQueue('python-worker', { durable: false })
  ch.sendToQueue('python-worker', Buffer.from(JSON.stringify(msg)))
}

export { startDatasetStatusConsumer, sendToWorkerQueue }