import fs from 'fs'
import csvParse from 'csv-parse/lib/sync'

import { fullDatasetPath } from '../../lib/util'

export default class Dataset {
  constructor(id, name, path, owner, computed, generating = false, columns = []) {
    this.id = id
    this.name = name
    this.path = path
    this.owner = owner
    this.computed = computed
    this.generating = generating
    this.columns = columns
  }

  fullPath() {
    return fullDatasetPath(this.path)
  }

  rows() {
    const path = this.fullPath()
    let rows = []

    try {
      if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
        const fileString = fs.readFileSync(path, 'utf8')
        const csv = csvParse(fileString, { columns: true })
        rows = csv.map(r => JSON.stringify(r))
      }
    } catch(err) {
      console.log(err)
    }

    return rows
  }

  samples() {
    const path = this.fullPath()
    let samples = []

    try {
      if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
        const fileString = fs.readFileSync(path, 'utf8')
        const csv = csvParse(fileString, { columns: true })
        samples = csv.slice(0, 10).map(r => JSON.stringify(r))
      }
    } catch(err) {
      console.log(err)
    }

    return samples
  }

  deleteDataset() {
    const path = this.fullPath()
    try {
      if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
        fs.unlinkSync(path)
      }
    } catch(err) {
      console.log(err)
    }
  }
}
