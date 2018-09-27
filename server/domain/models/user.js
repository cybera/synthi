const bcrypt = require('bcrypt')

export default class User {
  constructor(username, data = {}) {
    this.username = username
    this.id = data.id
    this.password = data.password
  }

  async hashPassword(password) {
    this.password = await bcrypt.hash(password, 16)
  }

  validPassword(password) {
    return bcrypt.compare(password, this.password)
  }
}
