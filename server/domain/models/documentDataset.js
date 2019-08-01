import pathlib from 'path'

import Dataset from './dataset'

class DocumentDataset extends Dataset {
  constructor(node) {
    super(node)

    this.paths = {

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
}

Dataset.ModelFactory.register(DocumentDataset, 'Dataset', { type: 'document' })

export default DocumentDataset
