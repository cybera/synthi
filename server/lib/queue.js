import { pubsub } from '../graphql/pubsub'
import AMQP from 'amqplib'

const DATASET_GENERATED = 'DATASET_GENERATED'

function startDatasetStatusConsumer() {
  return AMQP.connect('amqp://queue').then((conn) => {
    return conn.createChannel().then(async (ch) => {
      let queueName = 'dataset-status';

      await ch.assertExchange(queueName, 'fanout', {durable: false})
      await ch.assertQueue('dataset-status', {durable: false})
      await ch.bindQueue(queueName, queueName, '')
      await ch.consume('dataset-status', (msg) => {
        const msgJSON = JSON.parse(msg.content.toString())
        pubsub.publish(DATASET_GENERATED, { datasetGenerated: msgJSON });
        console.log(" [x] Received '%s'", msgJSON);
      }, {noAck: true})
      
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
  }).catch(console.warn)
}

export { startDatasetStatusConsumer }