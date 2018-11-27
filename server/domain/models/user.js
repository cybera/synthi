import { safeQuery } from '../../neo4j/connection'

const bcrypt = require('bcrypt')
const crypto = require('crypto')

export default class User {
  constructor(id, username, password = null, orgs = [], apikey) {
    this.id = id
    this.username = username
    this.password = password
    this.orgs = orgs
    this.apikey = apikey
  }

  async hashPassword(password) {
    this.password = await bcrypt.hash(password, 16)
  }

  validPassword(password) {
    return bcrypt.compare(password, this.password)
  }

  regenerateAPIKey() {
    this.apikey = crypto.randomBytes(64).toString('base64').replace(/[^A-Za-z0-9]/g, '').substring(0, 32)

    const { apikey, id } = this

    safeQuery(`
      MATCH (u:User)
      WHERE ID(u) = toInteger($id)
      SET u.apikey = $apikey
    `, { id, apikey })
  }
}
