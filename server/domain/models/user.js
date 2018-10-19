const bcrypt = require('bcrypt')

export default class User {
  constructor(id, username, password = null, orgs = []) {
    this.id = id
    this.username = username
    this.password = password
    this.orgs = orgs
  }

  async hashPassword(password) {
    this.password = await bcrypt.hash(password, 16)
  }

  validPassword(password) {
    return bcrypt.compare(password, this.password)
  }
}
