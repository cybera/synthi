import fs from 'fs'
import csvParse from 'csv-parse/lib/sync'
import Storage from '../../storage'
import { fullDatasetPath, csvFromStream } from '../../lib/util'

export default class Dataset {
  constructor(id, name, path, owner, computed = false, generating = false, columns = []) {
    this.id = id
    this.name = name
    this.path = path
    this.owner = owner
    this.computed = computed
    this.generating = generating
    this.columns = columns
  }

  fullPath() {
    return fullDatasetPath(this.path)
  }

  async rows() {
    if (this.path && await Storage.exists('datasets', this.path)) {
      const readStream = await Storage.createReadStream('datasets', this.path)
      const csv = await csvFromStream(readStream)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  async samples() {
    if (this.path && await Storage.exists('datasets', this.path)) {
      const readStream = await Storage.createReadStream('datasets', this.path)
      const csv = await csvFromStream(readStream, 0, 10)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  deleteDataset() {
    try {
      Storage.remove('datasets', this.path)
    } catch(err) {
      console.log(err)
    }
  }
}
