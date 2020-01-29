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

      // If we're computed, the original is the same as the imported
      if (this.computed) {
        this.paths.original = this.paths.imported
      }
    }
  }

  upload({ stream, filename, mimetype }) {
    const extension = pathlib.extname(filename)
    this.paths.original = `${this.uuid}/original${extension}`

    super.upload({ stream, filename, mimetype })
  }

  async import(removeExisting = false, options = {}) {
    const ImportDocumentTask = Base.ModelFactory.getClass('ImportDocumentTask')
    const task = await ImportDocumentTask.create({ dataset: this, removeExisting, options })
    await task.run()
  }

  downloadName() {
    const extension = pathlib.extname(this.originalFilename || '')
    return `${this.name}${extension}`
  }

  async deleteStorage() {
    Storage.remove('datasets', this.paths.original)
    Storage.remove('datasets', this.paths.imported)
  }

  // TODO: We should probably be figuring out if we're dealing with
  // regular text in a smarter way than this. Perhaps by actually
  // looking at the filestream when uploaded. Something like this
  // would be great: https://www.npmjs.com/package/file-type
  // If only it detected regular txt files as one of the types...
  isRawText() {
    if (this.mimetype === 'text/plain') {
      return true
    }

    return false
  }
}

Dataset.ModelFactory.register(DocumentDataset, 'Dataset', { type: 'document' })

export default DocumentDataset
