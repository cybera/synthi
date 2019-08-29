import pathlib from 'path'
import logger from '../../config/winston'

import Base from './base'
import Dataset from './dataset'
import Storage from '../../storage'

class DocumentDataset extends Dataset {
  constructor(node) {
    super(node)

    this.importTask = 'import_document'

    if (this.uuid) {
      const extension = pathlib.extname(this.originalFilename || '')

      this.paths = {
        original: `${this.uuid}/original${extension}`,
        imported: `${this.uuid}/imported.txt`,
      }
    }
  }

  upload({ stream, filename }) {
    const extension = pathlib.extname(filename)
    this.paths.original = `${this.uuid}/original${extension}`

    super.upload({ stream, filename })
  }

  async import(removeExisting = false, options = {}) {
    const ImportDocumentTask = Base.ModelFactory.getClass('ImportDocumentTask')
    const task = await ImportDocumentTask.create({ dataset: this, removeExisting, options })
    await task.run()
  }

  async deleteStorage() {
    Storage.remove('datasets', this.paths.original)
    Storage.remove('datasets', this.paths.imported)
  }

  downloadName() {
    const extension = pathlib.extname(this.originalFilename || '')
    return `${this.name}${extension}`
  }

  readStream() {
    logger.info(`Reading ${this.paths.original}`)
    return Storage.createReadStream('datasets', this.paths.original)
  }

  async deleteStorage() {
    Storage.remove('datasets', this.paths.original)
    Storage.remove('datasets', this.paths.imported)
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async handleUpdate(msg) {
    // Do nothing
  }
}

Dataset.ModelFactory.register(DocumentDataset, 'Dataset', { type: 'document' })

export default DocumentDataset
