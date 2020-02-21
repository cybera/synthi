import pathlib from 'path'
import logger from '../../config/winston'

import Base from './base'
import Dataset from './dataset'
import Storage from '../../storage'

class DatasetOther extends Dataset {
  constructor(node) {
    super(node)

    this.importTask = null

    if (this.uuid) {
      const extension = pathlib.extname(this.originalFilename || '')

      this.paths = {
        original: `${this.uuid}/original${extension}`,
      }

      // This dataset doesn't do any importing for you. The file you upload is
      // what you have to work with in subsequent transformations, etc.
      this.paths.imported = this.paths.original
    }
  }

  async upload({ stream, filename, mimetype }) {
    const extension = pathlib.extname(filename)
    this.paths.original = `${this.uuid}/original${extension}`

    await super.upload({ stream, filename, mimetype })
  }

  downloadName(variant) {
    return `${this.name}.${this.format}`
  }

  downloadOptions() {
    const options = super.downloadOptions()
    return options.filter(opt => opt.variant !== 'imported')
  }

  async deleteStorage() {
    Storage.remove('datasets', this.paths.original)
  }
}

Dataset.ModelFactory.register(DatasetOther, 'Dataset', { type: 'other' })

export default DatasetOther
