import config from 'config'
import getStream from 'get-stream'

import * as ObjectStorage from './object'
import logger from '../config/winston'

const storageType = config.get('storage.type')

let Storage = ObjectStorage // eslint-disable-line import/no-mutable-exports

if (storageType !== 'object') {
  // If object storage isn't explicitly being used, we'll still have
  // to fall back to it if there are no better options, but we should
  // warn about that.
  logger.warn('Unknown storage.type. Defaulting to object storage.')
}

const read = (area, relativePath) => getStream(Storage.createReadStream(area, relativePath))

export default { ...Storage, read }
