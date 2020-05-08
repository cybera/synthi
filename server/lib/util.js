import waitOn from 'wait-on'
import shortid from 'shortid'
import csvParse from 'csv-parse'

import Storage from '../storage'
import logger from '../config/winston'

export const waitForFile = relPath => new Promise((resolve, reject) => {
  // TODO: This will need to change when using non-local storage
  waitOn({
    resources: [`file:${fullDatasetPath(relPath)}`],
    interval: 1000,
    timeout: 60000
  }, err => (err ? reject(err) : resolve()))
})

export const storeFS = async ({ stream, filename }, unique = false) => {
  const id = shortid.generate()
  const uniqueFilename = unique ? `${id}-${filename}` : filename
  logger.info(`Storing ${filename}`)

  let bytes = 0

  return new Promise(
    (resolve, reject) => stream
      .on('error', (error) => {
        logger.error(`Error reading upload stream: ${error}`)
        if (stream.truncated) {
          logger.info('Truncated stream...')
          // Delete the truncated file
          Storage.cleanupOnError('datasets', uniqueFilename)
        }
        reject(error)
      })
      .on('data', (chunk) => {
        bytes += chunk.length
      })
      .pipe(Storage.createWriteStream('datasets', uniqueFilename))
      .on('error', (error) => {
        logger.error(`Error piping to write stream: ${error}`)
        reject(error)
      })
      .on('finish', () => {
        logger.info(`Finishing upload of ${filename} (${bytes} bytes)`)
        return resolve({ id, path: uniqueFilename, bytes })
      })
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
      let record
      while ((record = parser.read())) {
        output.push(record)
      }
    })
    .on('end', resolve)
    .on('error', err => reject(err)))

  stream.pipe(parser)

  return parseStream.then(() => output)
}

/*
  Return true if all properties in the 2nd parameter
  exist in the first and are equal.

  Note that this assumes a relatively flat map. Equality
  depends on whatever Javascript thinks it is using the
  === operator. This works well enough for the current
  intended purpose, but if you want deeper comparisons
  you might need to do some more testing and modifications.
*/
export const containsProperties = (obj, properties) => {
  let contained = true

  Object.keys(properties).forEach((key) => {
    if (!(key in obj && obj[key] === properties[key])) {
      contained = false
    }
  })

  return contained
}
