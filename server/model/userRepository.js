import { safeQuery } from '../neo4j/connection'
import User from './user'

export default class UserRepository {
  static async get(id) {
    const query = [`MATCH (n:User)
      WHERE ID(n) = $id
      RETURN
        n.username AS username,
        n.password AS password,
        ID(n) AS id`, { id }]
    const result = (await safeQuery(...query))[0]
    if (!result) {
      return null
    }
    return new User(result.username, result)
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
    return new User(result.username, result)
  }

  /* static async create(data) {
    const user = this.createUser(data.username, data)
    const query = [`CREATE (n:User { username: $user.username, password: $user.password })
      RETURN
        n.username AS username,
        n.password AS password,
        ID(n) AS id`, { user }]
    const { id } = await safeQuery(...query)
    user.id = id
    return user
  } */
}
