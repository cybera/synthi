import csvParse from 'csv-parse/lib/sync'
import fs from 'fs'
import { fullDatasetPath } from '../lib/util'

export default class Dataset {
  constructor(name, path, owner, computed) {
    this.name = name
    this.path = path
    this.owner = owner
    this.computed = computed
    }

    this.columns = columnNames.map((columnName, index) => ({ name: columnName, order: index + 1 }))
  }
}
