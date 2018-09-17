import csvParse from 'csv-parse/lib/sync'
import fs from 'fs'

export default class Dataset {
  constructor(name, path, owner, computed) {
    this.name = name
    this.path = path
    this.owner = owner
    this.computed = computed

    const fileString = fs.readFileSync(path, 'utf8')
    const csv = csvParse(fileString, { columns: true })

    let columnNames = []
    if (csv && csv.length > 0) {
      columnNames = Object.keys(csv[0])
    }

    this.columns = columnNames.map((columnName, index) => ({ name: columnName, order: index + 1 }))
  }
}
