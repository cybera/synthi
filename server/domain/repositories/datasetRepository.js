import { safeQuery } from '../../neo4j/connection'
import Dataset from '../models/dataset'
import canAccessDataset from '../policies/canAccessDataset'
import utils from './utils'

export default class DatasetRepository {
  static async get(context, id) {
    id = parseInt(id, 10)
    const query = this.buildQuery('WHERE ID(d) = toInteger($id)')
    const result = await safeQuery(query, { id })
    if (!result[0]) {
      return null
    }
    const dataset = await utils.createDataset(result[0])
    return canAccessDataset(context.user, dataset) ? dataset : null
  }

  static async getByName(context, name) {
    const query = this.buildQuery('WHERE d.name = $name')
    const result = await safeQuery(query, { name })
    if (!result[0]) {
      return null
    }
    const dataset = await utils.createDataset(result[0])
    return canAccessDataset(context.user, dataset) ? dataset : null
  }

  static async getAll(context) {
    const query = this.buildQuery('')
    const results = await safeQuery(query)
    const datasets = await Promise.all(results.map(d => utils.createDataset(d)))
    return datasets.filter(d => canAccessDataset(context.user, d))
  }

  static async create(context, data) {
    let { name } = data
    if (!name) {
      name = await this.uniqueDefaultName(data.owner)
    }
    const dataset = new Dataset(null, name, data.path, data.owner, data.computed,
      data.generating, [])

    if (!canAccessDataset(context.user, dataset)) {
      throw new Error('Not authorized')
    }

    const query = [`
      MATCH (o:Organization)
      WHERE ID(o) = toInteger($dataset.owner.id)
      CREATE (d:Dataset { name: $dataset.name })
      SET d.path = $dataset.path,
        d.computed = $dataset.computed,
        d.generating = $dataset.generating
      CREATE (o)-[:OWNER]->(d)
      RETURN ID(d) AS id
    `, { dataset }]

    const result = await safeQuery(...query)
    dataset.id = result[0].id

    return dataset
  }

  static async save(context, dataset) {
    if (!canAccessDataset(context.user, dataset)) {
      throw new Error('Not authorized')
    }

    if (!(await this.isUnique(dataset))) {
      throw new Error('Name must be unique')
    }

    const query = [`
      MATCH (n:Dataset)
      WHERE ID(n) = toInteger($dataset.id)
      SET
        n.name = $dataset.name,
        n.path = $dataset.path,
        n.computed = $dataset.computed,
        n.generating = $dataset.generating
    `, { dataset }]

    await safeQuery(...query)
  }

  static async delete(context, dataset) {
    if (typeof (dataset) === 'number') {
      dataset = await this.get(context, dataset)
    }

    if (!canAccessDataset(context.user, dataset)) {
      throw new Error('Not authorized')
    }

    const query = [`
      MATCH (d:Dataset)
      WHERE ID(d) = toInteger($dataset.id)
      OPTIONAL MATCH (d)<--(c:Column)
      OPTIONAL MATCH (t:Transformation)-[:OUTPUT]->(d)
      DETACH DELETE d, c, t`, { dataset }]
    safeQuery(...query)

    try {
      dataset.deleteDataset()
    } catch (e) {
      console.log(e.message)
    }

    return dataset
  }

  static buildQuery(where) {
    return `MATCH (d:Dataset)<-[:OWNER]-(o:Organization)
      ${where}
      OPTIONAL MATCH (d)<--(c:Column)
      RETURN
        ID(d) AS id,
        d.name AS name,
        d.computed AS computed,
        COALESCE(d.generating, false) AS generating,
        d.path AS path,
        COLLECT(c) AS columns,
        o AS owner`
  }

  static async uniqueDefaultName(owner) {
    const query = `
      MATCH (d:Dataset)<-[:OWNER]-(o:Organization)
      WHERE ID(o) = toInteger($owner_id) AND d.name STARTS WITH 'New Dataset '
      RETURN d.name AS name
    `
    const names = await safeQuery(query, { owner_id: owner.id })
    const defaultNameRE = /^New Dataset (\d+)$/
    const extractIndex = (str) => {
      const matches = str.match(defaultNameRE)
      return matches && matches[1] ? parseInt(matches[1], 10) : 0
    }
    const indices = names.map(n => extractIndex(n.name))
    const maxIndex = Math.max(...indices, 0)

    return `New Dataset ${maxIndex + 1}`
  }

  static async isUnique(dataset) {
    const query = [`
      MATCH (d:Dataset { name: $dataset.name })<-[:OWNER]-(o:Organization)
      WHERE ID(o) = toInteger($dataset.owner.id) AND ID(d) <> toInteger($dataset.id)
      RETURN d`, { dataset }]

    const results = await safeQuery(...query)

    return results.length === 0
  }

  static async datasetConnections(dataset) {
    const query = `MATCH (root:Dataset)
    WHERE ID(root) = toInteger($id)
    OPTIONAL MATCH p=(root)<-[*]-(a:Dataset)
    WITH relationships(p) AS r, root
    UNWIND CASE WHEN size(r) IS NULL THEN [NULL] ELSE r END AS rs
    WITH CASE 
      WHEN rs IS NULL THEN {original:ID(root), name:root.name, kind:root.kind}
        ELSE {start:{
              node: ID(startNode(rs)), 
              kind: labels(startNode(rs))[0],
              name: startNode(rs).name,
              inputs: startNode(rs).inputs,
              outputs: startNode(rs).outputs
              }, 
              type: type(rs), 
              end:{
                node: ID(endNode(rs)), 
                kind: labels(endNode(rs))[0],
                name:endNode(rs).name,
                inputs: endNode(rs).inputs,
                outputs: endNode(rs).outputs

              }}
    END AS connection
    RETURN connection`

    const connections = await safeQuery(query, { id: dataset.id })
    return JSON.stringify(connections)
  }
}
