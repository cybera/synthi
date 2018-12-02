import Base from './base'

class Column extends Base {
  constructor(node) {
    super(node)
  }
}

Column.label = 'Column'
Column.saveProperties = ['name', 'order']

export default Column
