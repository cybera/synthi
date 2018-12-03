export default class Organization {
  constructor(id, name, members = []) {
    this.id = id
    this.name = name
    this.members = members
  }

  addMember(user) {
    this.members.push(user)
  }

  removeMember(user) {
    this.members.splice(this.members.findIndex(member => member.id === user.id), 1)
  }
}
