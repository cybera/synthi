import Base from './base'

class Tag extends Base {
  static readonly label = 'Tag'
  static readonly saveProperties = ['name', 'system']

  name: string
  system: boolean

  static getByName(name: string): Promise<Tag|null> {
    const query = `
      MATCH (tag:${this.label} { name: $name })
      return tag
    `

    return this.getByUniqueMatch(query, { name })
  }

  static findByPrefix(prefix: string): Promise<Tag[]> {
    const query = 'WHERE node.name STARTS WITH $prefix'

    return this.find(query, { prefix })
  }
}

Base.ModelFactory.register(Tag)

export default Tag
