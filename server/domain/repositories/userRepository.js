import { safeQuery } from '../../neo4j/connection'
import User from '../models/user'
import utils from './utils'

export default class UserRepository {
  static async get(id) {
    const query = this.buildQuery('WHERE ID(u) = toInteger($id)')
    const result = (await safeQuery(query, { id }))[0]

    if (!result) {
      return null
    }

    return utils.createUser(result)
  }

  static async getByUsername(username) {
    const query = this.buildQuery('WHERE u.username = $username')
    const result = (await safeQuery(query, { username }))[0]

    if (!result) {
      return null
    }

    return utils.createUser(result)
  }

  static async getByAPIKey(apikey) {
    const query = this.buildQuery('WHERE u.apikey = $apikey')
    const result = (await safeQuery(query, { apikey }))[0]

    if (!result) {
      return null
    }

    return utils.createUser(result)
  }

  static async create(data) {
    const user = new User(null, data.username)
    await user.hashPassword(data.password)
    const query = [`CREATE (n:User { username: $user.username, password: $user.password })
      RETURN ID(n) AS id`, { user }]
    const result = await safeQuery(...query)
    user.id = result[0].id
    return user
  }

  static delete(id) {
    const query = [`MATCH (u:User)
      WHERE ID(u) = toInteger($id)
      DETACH DELETE u`, { id }]
    safeQuery(...query)
  }

  static buildQuery(where) {
    return `MATCH (u:User)-[:MEMBER]->(o:Organization)
      ${where}
      RETURN
        ID(u) AS id,
        u.username AS username,
        u.password AS password,
        u.apikey AS apikey,
        COLLECT(o) AS orgs`
  }
}
