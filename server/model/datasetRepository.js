import { safeQuery } from '../neo4j/connection'
import Dataset from './dataset'
import UserRepository from './userRepository'

export default class DatasetRepository {
  static async get(id) {
    const query = [`MATCH (n:Dataset)
      WHERE ID(n) = $id
      RETURN
        n.name AS name,
        n.owner_id AS owner_id,
        ID(n) AS id,
        n.path AS path`, { id }]
    const result = await safeQuery(...query)
    if (!result[0]) {
      return null
    }
    const owner = UserRepository.get(result[0].owner_id)
    return new Dataset(result[0].name, result[0].path, owner)
  }

  static async create(data) {
    const dataset = new Dataset(data.name, data.path, data.owner)
    const query = [`
      CREATE (n:Dataset { name: $dataset.name })
      WITH n
      UNWIND $dataset.columns AS column
      MERGE (n)<-[:BELONGS_TO]-(:Column { name: column.name, order: column.order })
      SET n.path = $dataset.path, n.owner_id = toInteger($dataset.owner.id)
      WITH n
      RETURN ID(n) AS id
    `, { dataset }]
    const result = await safeQuery(...query)
    dataset.id = result[0].id
    return dataset
  }
}
