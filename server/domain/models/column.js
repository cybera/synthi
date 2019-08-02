import Base from './base'

class Column extends Base {

}

Column.label = 'Column'
Column.saveProperties = ['name', 'order']

Base.ModelFactory.register(Column)

export default Column
