import { safeQuery } from '../../neo4j/connection'
import Organization from '../models/organization'
import utils from './utils'

export default class OrganizationRepository {
  static async get(id) {
    const query = [`MATCH (o:Organization)<-[:MEMBER]-(u:User)
      WHERE ID(o) = toInteger($id)
      RETURN
        ID(o) AS id,
        o.name AS name,
        COLLECT({ id: ID(u), info: u }) AS users`, { id }]

    const result = (await safeQuery(...query))[0]

    if (!result) {
      return null
    }

    return utils.createOrg(result)
  }

  static async getAll(context) {
    const user = { context }
    const query = [`MATCH (o:Organization)<-[:MEMBER]-(u:User)
      WHERE ID(u) = toInteger($user.id)
      RETURN
        ID(o) AS id,
        o.name AS name,
        COLLECT({ id: ID(u), info: u }) AS users`, { user }]

    const results = (await safeQuery(...query))

    return results.map(org => utils.createOrg(org))
  }

  static async create(data) {
    const org = new Organization(null, data.name)

    const query = [`CREATE (o:Organization { name: $org.name })
      RETURN ID(o) AS id`]

    const result = await safeQuery(...query)
    org.id = result[0].id

    return org
  }

  static delete(id) {
    const query = [`MATCH (o:Organization)
      WHERE ID(o) = toInteger($id)
      DETACH DELETE o`, { id }]

    safeQuery(...query)
  }
}
