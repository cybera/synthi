import Dataset from './dataset'
import Column from './column'

import Storage from '../../storage'
import { csvFromStream } from '../../lib/util'
import { safeQuery } from '../../neo4j/connection'
import logger from '../../config/winston'

class DatasetCSV extends Dataset {
  constructor(node) {
    super(node)

    if (!this.type) {
      this.type = 'csv'
    }

    this.importTask = 'import_csv'
    this.paths = {
      original: `${this.uuid}/original.csv`,
      imported: `${this.uuid}/imported.csv`,
      sample: `${this.uuid}/sample.csv`
    }
  }

  async columns() {
    const columns = await this.relatedMany('<-[:BELONGS_TO]-', Column, 'column')
    return columns.sort((c1, c2) => c1.order - c2.order)
  }

  async rows() {
    if (await Storage.exists('datasets', this.paths.imported)) {
      const readStream = await Storage.createReadStream('datasets', this.paths.imported)
      const csv = await csvFromStream(readStream)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  async samples() {
    logger.info(`looking for samples for: ${this.uuid} / ${this.id}`)
    if (await Storage.exists('datasets', this.paths.sample)) {
      const readStream = await Storage.createReadStream('datasets', this.paths.sample)
      const csv = await csvFromStream(readStream, 0, 10)
      return csv.map(r => JSON.stringify(r))
    }
    return []
  }

  async delete() {
    const query = [`
      MATCH (d:Dataset)
      WHERE ID(d) = toInteger($dataset.id)
      OPTIONAL MATCH (d)<--(c:Column)
      DETACH DELETE c`, { dataset: this }]
    await safeQuery(...query)

    await super.delete()
  }

  async handleQueueUpdate(msg) {
    logger.info(`message for dataset: ${this.id}\n%o`, msg)
    const { status } = msg

    if (status !== 'error' && msg.task === 'generate') {
      const { datasetColumns } = msg.data
      logger.info('columns:\n%o', datasetColumns)
    } else {
      super.handleQueueUpdate(msg)
    }
  }

  downloadName() {
    return `${this.name}.csv`
  }
}

Dataset.ModelFactory.register(DatasetCSV, 'Dataset', { type: 'csv' })

export default DatasetCSV
