import Base from './base'
import Dataset from './dataset'

import Storage from '../../storage'
import { csvFromStream } from '../../lib/util'
import { safeQuery } from '../../neo4j/connection'
import logger from '../../config/winston'

class DatasetCSV extends Dataset {
  constructor(node) {
    super(node)

    if (!this.format) {
      this.format = 'csv'
    }
  }

  get paths() {
    return {
      ...super.paths,
      original: `${this.uuid}/original.csv`,
      imported: `${this.uuid}/imported.csv`,
      sample: `${this.uuid}/sample.csv`
    }
  }

  async columns() {
    const columns = await this.relatedMany('<-[:BELONGS_TO]-', 'Column')
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

  async handleUpdate(data) {
    await super.handleUpdate(data)

    const { columns } = data;

    if (columns) {
      await this.handleColumnUpdate(columns);
    } else {
      logger.warn(`No column updates for Dataset: ${this.name} (${this.uuid})`);
    }
  }

  downloadName(variant) {
    return `${this.name}.csv`
  }

  async import(removeExisting = false, options = {}) {
    const ImportCSVTask = Base.ModelFactory.getClass('ImportCSVTask')
    const importCSVTask = await ImportCSVTask.create({ dataset: this, removeExisting, options })
    await importCSVTask.run()
  }

  async deleteStorage() {
    Storage.remove('datasets', this.paths.original)
    Storage.remove('datasets', this.paths.imported)
    Storage.remove('datasets', this.paths.sample)
  }

  async handleColumnUpdate(columnList) {
    logger.debug(`Column List for ${this.id}:\n%o`, columnList)

    const cleanDeadColumnsQuery = `
      MATCH (column:Column)-[:BELONGS_TO]->(:Dataset { uuid: $dataset.uuid })
      WHERE NOT column.name IN $columnNames
      DETACH DELETE column
    `
    const columnNames = columnList.map(column => column.name)
    safeQuery(cleanDeadColumnsQuery, { dataset: this, columnNames })

    const updateColumnsQuery = `
      MATCH (dataset:Dataset { uuid: $dataset.uuid })
      UNWIND $columns AS updated
      MERGE (column:Column { name: updated.name })-[:BELONGS_TO]->(dataset)
      SET column.order = updated.order, column.originalName = updated.originalName
      WITH column, updated
      UNWIND updated.tags as tagName
      MATCH (tag:Tag { name: tagName})
      MERGE (tag)-[:DESCRIBES]->(column)
    `
    await safeQuery(updateColumnsQuery, { dataset: this, columns: columnList })

    this.generating = false
    await this.save()
    await this.touch()
  }
}

Dataset.ModelFactory.register(DatasetCSV, 'Dataset', { type: 'csv' })

export default DatasetCSV
