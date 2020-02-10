import { safeQuery } from '../../neo4j/connection'
import Base from './base'

const bcrypt = require('bcryptjs')
const crypto = require('crypto')

class User extends Base {
  static async getByUsername(username) {
    const query = `
      MATCH (node:${this.label} { username: $username })
      RETURN node
    `
    return this.getByUniqueMatch(query, { username })
  }

  static async getByAPIKey(apikey) {
    const query = `
      MATCH (node:${this.label} { apikey: $apikey })
      RETURN node
    `
    return this.getByUniqueMatch(query, { apikey })
  }

  async orgs() {
    const Organization = Base.ModelFactory.getClass('Organization')

    return this.relatedMany('-[:MEMBER]->', 'Organization')
  }

  async hashPassword(password) {
    this.password = await bcrypt.hash(password, 16)
  }

  validPassword(password) {
    return bcrypt.compare(password, this.password)
  }

  async regenerateAPIKey() {
    this.apikey = crypto.randomBytes(64).toString('base64').replace(/[^A-Za-z0-9]/g, '').substring(0, 32)

    const { apikey, id } = this

    await safeQuery(`
      MATCH (u:User)
      WHERE ID(u) = toInteger($id)
      SET u.apikey = $apikey
    `, { id, apikey })
  }

  async canAccess(user, field) {
    const protectedFields = ['apikey', 'password']
    if (protectedFields.includes(field)) {
      return user.uuid === this.uuid
    }
    return true
  }
}

User.label = 'User'
User.saveProperties = ['apikey', 'username', 'password']

Base.ModelFactory.register(User)

export default User
