import pathlib from 'path'
import fs from 'fs'
import waitOn from 'wait-on'
import AMQP from 'amqplib'

const runTransformation = async (dataset) => {
  const conn = await AMQP.connect('amqp://queue')
  const ch = await conn.createChannel()
  const ok = await ch.assertQueue('python-worker', { durable: false })
  ch.sendToQueue('python-worker', Buffer.from(`engine.py ${dataset.id}`))
}

const datasetExists = (dataset) => {
  return (dataset.path && fs.existsSync(dataset.path))
}

const ensureDatasetExists = (dataset) => {
  if(!datasetExists(dataset) && dataset.computed) {
    runTransformation(dataset)
  }
}

const waitForFile = (relPath) => {
  return new Promise((resolve, reject) => {
    // TODO: This will need to change when using non-local storage
    waitOn({ 
      resources: [`file:${fullDatasetPath(relPath)}`],
      interval: 1000,
      timeout: 60000
    }, err => err ? reject(err) : resolve() )
  })
}

const fullDatasetPath = (relPath) => {
  const uploadDir = pathlib.resolve(process.env.UPLOADS_FOLDER)
  const fullPath = pathlib.join(uploadDir, relPath)
  return fullPath
}

export { runTransformation, datasetExists, ensureDatasetExists, waitForFile, fullDatasetPath }