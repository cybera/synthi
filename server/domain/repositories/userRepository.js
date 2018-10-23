import { safeQuery } from '../../neo4j/connection'
import User from '../models/user'

export default class UserRepository {
  static async get(id) {
    const query = [`MATCH (n:User)
      WHERE ID(n) = toInteger($id)
      RETURN
        n.username AS username,
        n.password AS password,
        ID(n) AS id`, { id }]
    const result = (await safeQuery(...query))[0]
    if (!result) {
      return null
    }
    return this.createUser(result)
  }

  static async getByUsername(username) {
    const query = [`MATCH (n:User)
      WHERE n.username = $username
      RETURN
        n.username AS username,
        n.password AS password,
        ID(n) AS id`, { username }]
    const result = (await safeQuery(...query))[0]
    if (!result) {
      return null
    }
    return this.createUser(result)
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

  static async createUser(result) {
    return new User(result.id, result.username, result.password)
  }
}
