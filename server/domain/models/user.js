const bcrypt = require('bcrypt')

export default class User {
  constructor(id, username, password = null) {
    this.id = id
    this.username = username
    this.password = password
  }

  async hashPassword(password) {
    this.password = await bcrypt.hash(password, 16)
  }

  validPassword(password) {
    return bcrypt.compare(password, this.password)
  }
}
