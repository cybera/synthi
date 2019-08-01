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
}

Dataset.ModelFactory.register(DocumentDataset, 'Dataset', { type: 'document' })

export default DocumentDataset
