import Base from './base'
import Organization from './organization'
import Column from './column'

import Storage from '../../storage'
import { fullDatasetPath, csvFromStream } from '../../lib/util'
import canAccessDataset from '../policies/canAccessDataset'

class Dataset extends Base {
  static async getByName(organization, name) {
    return organization.datasetByName(name)
  }

  constructor(node) {
    super(node)
  }

  async columns() {
    return this.relatedMany('<-[:BELONGS_TO]-', Column, 'column')
  }

  async owner() {
    return this.relatedOne('<-[:OWNER]-', Organization, 'owner')
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

  readStream() {
    return Storage.createReadStream('datasets', this.path)
  }

  deleteDataset() {
    try {
      Storage.remove('datasets', this.path)
    } catch(err) {
      console.log(err)
    }
  }

  canAccess(user) {
    return canAccessDataset(user, this)
  }
}

Dataset.label = 'Dataset'

export default Dataset
