import AMQPManager from 'amqp-connection-manager'
import * as ModelFactory from '../domain/models/modelFactory'
import logger from '../config/winston'

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

  startChannel(conn, 'task-status', { durable: false, noAck: true }, async (msg) => {
    const msgJSON = JSON.parse(msg.content.toString())

    if (msgJSON.type === 'task-updated') {
      const task = await ModelFactory.getByUuid(msgJSON.taskid)
      task.done(msgJSON)
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
      setup: ch => {
        ch.assertQueue('python-worker', { durable: false })
        ch.assertQueue('tika-worker', { durable: false })
      }
    })
  }

  async sendToWorker(msg, queue) {
    if (!queue) {
      throw new Error('Queue name must be provided')
    }
    await this.worker.sendToQueue(queue, msg)
  }

  async sendToTikaWorker(msg) {
    await this.sendToWorker(msg, 'tika-worker')
  }

  async sendToPythonWorker(msg) {
    await this.sendToWorker(msg, 'python-worker')
  }

  close() {
    this.conn.close()
  }
}

const DefaultQueue = new AMQP()

export default DefaultQueue
