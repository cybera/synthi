import pathlib from 'path'
import logger from '../../config/winston'

import Base from './base'
import Dataset from './dataset'
import Storage from '../../storage'

class DatasetOther extends Dataset {
  constructor(node) {
    super(node)

    this.importTask = null
  }

  get paths() {
    const paths = super.paths
    if (this.uuid) {
      const extension = pathlib.extname(this.originalFilename || '')
      paths.original = `${this.uuid}/original${extension}`

      // This dataset doesn't do any importing for you. The file you upload is
      // what you have to work with in subsequent transformations, etc.
      paths.imported = this.paths.original
    }

    return paths
  }

  downloadName(variant) {
    return `${this.name}.${this.format}`
  }

  downloadOptions() {
    let options = super.downloadOptions()

    if (!this.computed) {
      options = options.filter(opt => opt.variant !== 'imported')
    }

    return options
  }

  async deleteStorage() {
    Storage.remove('datasets', this.paths.original)
  }
}

Dataset.ModelFactory.register(DatasetOther, 'Dataset', { type: 'other' })

export default DatasetOther
