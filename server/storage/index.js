import config from 'config'
import * as ObjectStorage from './object'
import * as LegacyStorage from './legacy'
import getStream from 'get-stream'

const storageType = config.get('storage.type')

let Storage = LegacyStorage // eslint-disable-line import/no-mutable-exports

if (storageType === 'object') {
  Storage = ObjectStorage
} else if (storageType !== 'legacy') {
  // If legacy storage isn't explicitly being used, we'll still have
  // to fall back to it if there are no better options, but we should
  // warn about that.
  console.log('Unknown storage.type. Defaulting to legacy storage.')
}

const read = (area, relativePath) => getStream(Storage.createReadStream(area, relativePath))

export default { ...Storage, read }
