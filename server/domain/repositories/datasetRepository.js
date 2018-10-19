import { safeQuery } from '../../neo4j/connection'
import Dataset from '../models/dataset'
import UserRepository from './userRepository'
import canViewDataset from '../policies/canViewDataset'
import canEditDataset from '../policies/canEditDataset'
import canDeleteDataset from '../policies/canDeleteDataset'

export default class DatasetRepository {
  static async get(context, id) {
    id = parseInt(id, 10)
    const query = this.buildQuery('WHERE ID(d) = $id')
    const result = await safeQuery(query, { id })
    if (!result[0]) {
      return null
    }
    const dataset = await this.createDataset(result[0])
    return canViewDataset(context.user, dataset) ? dataset : null
  }

  static async getByName(context, name) {
    const query = this.buildQuery('WHERE d.name = $name')
    const result = await safeQuery(query, { name })
    if (!result[0]) {
      return null
    }
    const dataset = await this.createDataset(result[0])
    return canViewDataset(context.user, dataset) ? dataset : null
  }

  static async getAll(context) {
    const query = this.buildQuery('')
    const results = await safeQuery(query)
    const datasets = await Promise.all(results.map(d => this.createDataset(d)))
    return datasets.filter(d => canViewDataset(context.user, d))
  }

  static async create(context, data) {
    if (!data.name) {
      data.name = await this.uniqueDefaultName(context.user)
    }
    const dataset = new Dataset(null, data.name, data.path, context.user, data.computed,
      data.generating, [])
    const query = [`
      CREATE (n:Dataset { name: $dataset.name })
      SET n.path = $dataset.path,
        n.owner_id = toInteger($dataset.owner.id),
        n.computed = $dataset.computed,
        n.generating = $dataset.generating
      RETURN ID(n) AS id
    `, { dataset }]
    const result = await safeQuery(...query)
    dataset.id = result[0].id
    return dataset
  }

  static save(context, dataset) {
    if (!canEditDataset(context.user, dataset)) {
      throw new Error('Not authorized')
    }

    const query = [`
      MATCH (n:Dataset)
      WHERE ID(n) = $dataset.id
      SET 
        n.name = $dataset.name,
        n.path = $dataset.path,
        n.owner_id = toInteger($dataset.owner.id),
        n.computed = $dataset.computed,
        n.generating = $dataset.generating
    `, { dataset }]

    safeQuery(...query)
  }

  static async delete(context, dataset) {
    if (typeof (dataset) === 'number') {
      dataset = await this.get(context, dataset)
    }

    if (!canDeleteDataset(context.user, dataset)) {
      throw new Error('Not authorized')
    }

    const query = [`
      MATCH (d:Dataset)
      WHERE ID(d) = $dataset.id
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
    return `MATCH (d:Dataset)
      ${where}
      OPTIONAL MATCH (d)<--(c:Column)
      RETURN
        ID(d) AS id,
        d.name AS name,
        d.owner_id AS owner_id,
        d.computed AS computed,
        COALESCE(d.generating, false) AS generating,
        d.path AS path,
        collect(c) AS columns`
  }

  static async createDataset(result) {
    const owner = await UserRepository.get(result.owner_id)
    const columns = result.columns.map(c => ({ id: c.identity, ...c.properties }))
      .sort((a, b) => a.order > b.order)
    return new Dataset(result.id, result.name, result.path, owner, result.computed,
      result.generating, columns)
  }

  static async uniqueDefaultName(owner) {
    const query = `
      MATCH (d:Dataset { owner_id: $owner_id })
      WHERE d.name STARTS WITH 'New Dataset '
      RETURN d.name AS name
    `
    const names = await safeQuery(query, { owner_id: owner.id })
    const defaultNameRE = /^New Dataset (\d+)$/
    const extractIndex = (str) => {
      let matches = str.match(defaultNameRE)
      return matches && matches[1] ? parseInt(matches[1]) : 0
    }
    const indices = names.map(n => extractIndex(n.name))
    const maxIndex = Math.max(...indices, 0)
    
    return `New Dataset ${maxIndex + 1}`
  }

  static async datasetConnections(dataset) {
    const query = `MATCH (root:Dataset)
    WHERE ID(root) = $id
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

    const connections = await safeQuery(query, {id: dataset.id})
    return JSON.stringify(connections) 
  }
}
