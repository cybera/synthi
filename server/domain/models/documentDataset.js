import pathlib from 'path'
import logger from '../../config/winston'

import Dataset from './dataset'
import Storage from '../../storage'

class DocumentDataset extends Dataset {
  constructor(node) {
    super(node)

    if (this.uuid) {
      const extension = pathlib.extname(this.originalFilename || '')

      this.paths = {
        original: `${this.uuid}/original${extension}`,
        imported: `${this.uuid}/original${extension}`,
      }
    }
  }

  async upload({ stream, filename }) {
    const extension = pathlib.extname(filename)
    this.paths.original = `${this.uuid}/original${extension}`

    super.upload({ stream, filename })
  }

  /* eslint-disable class-methods-use-this, no-unused-vars */
  async import(removeExisting = false, options = {}) {
    // Do nothing. Right now it doesn't really make sense to have to do
    // an import step.
  }
  /* eslint-enable class-methods-use-this, no-unused-vars */

  downloadName() {
    const extension = pathlib.extname(this.originalFilename || '')
    return `${this.name}${extension}`
  }

  readStream() {
    logger.info(`Reading ${this.paths.original}`)
    return Storage.createReadStream('datasets', this.paths.original)
  }
}

Dataset.ModelFactory.register(DocumentDataset, 'Dataset', { type: 'document' })

export default DocumentDataset
