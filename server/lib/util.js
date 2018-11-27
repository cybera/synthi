import pathlib from 'path'
import fs from 'fs'
import waitOn from 'wait-on'
import AMQP from 'amqplib'
import shortid from 'shortid'
import csvParse from 'csv-parse'
import config from 'config'

import Storage from '../storage'

export const runTransformation = async (dataset) => {
  const conn = await AMQP.connect('amqp://queue')
  const ch = await conn.createChannel()
  await ch.assertQueue('python-worker', { durable: false })

  const msg = {
    task: 'generate',
    id: dataset.id,
    ownerName: dataset.owner.name
  }

  ch.sendToQueue('python-worker', Buffer.from(JSON.stringify(msg)))
}

export const datasetExists = dataset => dataset.path && fs.existsSync(dataset.fullPath())

export const ensureDatasetExists = (dataset) => {
  if (!datasetExists(dataset) && dataset.computed) {
    runTransformation(dataset)
  }
}

export const fullDatasetPath = (relPath) => {
  const dataDir = pathlib.resolve(config.get('storage.legacy.dataRoot'))
  const fullPath = pathlib.join(dataDir, 'datasets', relPath || '')
  return fullPath
}

export const fullScriptPath = (relPath) => {
  const dataDir = pathlib.resolve(config.get('storage.legacy.dataRoot'))
  const fullPath = pathlib.join(dataDir, 'scripts', relPath || '')
  return fullPath
}

export const waitForFile = relPath => new Promise((resolve, reject) => {
  // TODO: This will need to change when using non-local storage
  waitOn({
    resources: [`file:${fullDatasetPath(relPath)}`],
    interval: 1000,
    timeout: 60000
  }, err => (err ? reject(err) : resolve()))
})

export const storeFS = ({ stream, filename }) => {
  const id = shortid.generate()
  const uniqueFilename = `${id}-${filename}`

  return new Promise(
    (resolve, reject) => stream
      .on('error', (error) => {
        console.log(error)
        if (stream.truncated) {
          // Delete the truncated file
          Storage.remove('datasets', uniqueFilename)
        }
        reject(error)
      })
      .pipe(Storage.createWriteStream('datasets', uniqueFilename))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ id, path: uniqueFilename }))
  )
}

export const csvFromStream = async (stream, from, to) => {
  const options = {
    delimeter: ',',
    columns: true,
    cast: true,
    from,
    to
  }

  const parser = csvParse(options)

  const output = []

  const parseStream = new Promise((resolve, reject) => parser
    .on('readable', () => {
      try {
        let record
        while ((record = parser.read())) {
          output.push(record)
        }
      } catch (err) {
        console.log(err)
      }
    })
    .on('end', resolve)
    .on('error', reject))

  stream.pipe(parser)

  return parseStream.then(() => output)
}
