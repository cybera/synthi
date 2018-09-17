import { safeQuery } from '../neo4j/connection'
import User from './user'

export default class UserRepository {
  static async get(id) {
    const query = [`MATCH (n:User)
      WHERE ID(n) = $id
      RETURN
        n.username AS username,
        ID(n) AS id`, { id }]
    const result = await safeQuery(...query)
    if (!result[0]) {
      return null
    }
    const user = new User(result[0].username)
    user.id = result[0].id
    return user
  }

  static async getByUsername(username) {
    const query = [`MATCH (n:User)
      WHERE n.username = $username
      RETURN
        n.username AS username,
        ID(n) AS id`, { username }]
    const result = await safeQuery(...query)
    if (!result[0]) {
      return null
    }
    const user = new User(result[0].username)
    user.id = result[0].id
    return user
  }

  static async create(data) {
    const user = new User(data.username)
    const query = [`CREATE (user:User { username: $user.username })
      RETURN ID(user) AS id`, { user }]
    const { id } = await safeQuery(...query)
    user.id = id
    return user
  }
}
