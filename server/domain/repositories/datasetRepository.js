import { safeQuery } from '../../neo4j/connection'
import Dataset from '../models/dataset'
import UserRepository from './userRepository'
import canViewDataset from '../policies/canViewDataset'
import canEditDataset from '../policies/canEditDataset'
import canDeleteDataset from '../policies/canDeleteDataset'

export default class DatasetRepository {
  static async get(context, id) {
    id = parseInt(id, 10)
    const query = [`MATCH (n:Dataset)
      WHERE ID(n) = $id
      RETURN
        ID(n) AS id,
        n.name AS name,
        n.owner_id AS owner_id,
        n.computed AS computed,
        COALESCE(n.generating, false) AS generating,
        n.path AS path`, { id }]
    const result = await safeQuery(...query)
    if (!result[0]) {
      return null
    }
    const dataset = await this.createDataset(result[0])
    return canViewDataset(context.user, dataset) ? dataset : null
  }

  static async getByName(context, name) {
    const query = [`MATCH (n:Dataset)
      WHERE n.name = $name
      RETURN
        ID(n) AS id,
        n.name AS name,
        n.owner_id AS owner_id,
        n.computed AS computed,
        COALESCE(n.generating, false) AS generating,
        n.path AS path`, { name }]
    const result = await safeQuery(...query)
    if (!result[0]) {
      return null
    }
    const dataset = await this.createDataset(result[0])
    return canViewDataset(context.user, dataset) ? dataset : null
  }

  static async getAll(context) {
    const query = [`MATCH (n:Dataset)
      RETURN
        ID(n) AS id,
        n.name AS name,
        n.owner_id AS owner_id,
        n.computed AS computed,
        COALESCE(n.generating, false) AS generating,
        n.path AS path`]
    const results = await safeQuery(...query)
    const datasets = await Promise.all(results.map(d => this.createDataset(d)))
    return datasets.filter(d => canViewDataset(context.user, d))
  }

  static async create(context, data) {
    const dataset = new Dataset(
      null,
      data.name,
      data.path,
      context.user,
      data.computed,
      data.generating,
      []
    )
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
      SET n.path = $dataset.path,
        n.owner_id = toInteger($dataset.owner.id),
        n.computed = $dataset.computed,
        n.generating = $dataset.generating
    `, { dataset }]

    safeQuery(...query)
  }

  static async delete(context, id) {
    const dataset = await this.get(context, id)

    if (!canDeleteDataset(context.user, dataset)) {
      throw new Error('Not authorized')
    }

    const query = [`
      MATCH (d:Dataset)
      WHERE ID(d) = $dataset.id
      OPTIONAL MATCH (d)<--(c:Column)
      WITH d, d.name AS name, ID(d) AS id, d.path as path, c
      DETACH DELETE d,c
      RETURN name, id, path
      LIMIT 1`, { dataset }]
    safeQuery(...query)
    dataset.deleteDataset()
  }

  static getColumns(id) {
    return safeQuery(`MATCH (d:Dataset)<--(c:Column)
      WHERE ID(d) = $id
      RETURN ID(c) AS id, c.name AS name, c.order AS order
      ORDER BY order`, { id })
  }

  static async createDataset(result) {
    const owner = await UserRepository.get(result.owner_id)
    const columns = await this.getColumns(result.id)

    return new Dataset(result.id, result.name, result.path, owner, result.computed, result.generating, columns)
  }
}
