import pathlib from 'path'
import fs from 'fs'
import waitOn from 'wait-on'
import AMQP from 'amqplib'
import shortid from 'shortid'

const runTransformation = async (dataset) => {
  const conn = await AMQP.connect('amqp://queue')
  const ch = await conn.createChannel()
  const ok = await ch.assertQueue('python-worker', { durable: false })

  const msg = {
    task: 'generate',
    id: dataset.id
  }

  ch.sendToQueue('python-worker', Buffer.from(JSON.stringify(msg)))
}

const datasetExists = (dataset) => {
  return (dataset.path && fs.existsSync(dataset.fullPath()))
}

const ensureDatasetExists = (dataset) => {
  if(!datasetExists(dataset) && dataset.computed) {
    runTransformation(dataset)
  }
}

const fullDatasetPath = (relPath) => {
  const uploadDir = pathlib.resolve(process.env.UPLOADS_FOLDER)
  const fullPath = pathlib.join(uploadDir, relPath)
  return fullPath
}

const waitForFile = (relPath) => {
  return new Promise((resolve, reject) => {
    // TODO: This will need to change when using non-local storage
    waitOn({
      resources: [`file:${fullDatasetPath(relPath)}`],
      interval: 1000,
      timeout: 60000
    }, err => (err ? reject(err) : resolve()))
  })
}

const storeFS = ({ stream, filename }) => {
  const id = shortid.generate()
  const uniqueFilename = `${id}-${filename}`
  const fullPath = fullDatasetPath(uniqueFilename)

  return new Promise(
    (resolve, reject) => stream
      .on('error', (error) => {
        console.log(error)
        if (stream.truncated) {
          // Delete the truncated file
          fs.unlinkSync(fullPath)
        }
        reject(error)
      })
      .pipe(fs.createWriteStream(fullPath))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ id, path: uniqueFilename }))
  )
}

export {
  runTransformation,
  datasetExists,
  ensureDatasetExists,
  waitForFile,
  fullDatasetPath,
  storeFS
}
