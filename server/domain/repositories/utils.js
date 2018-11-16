import Dataset from '../models/dataset'
import Organization from '../models/organization'
import User from '../models/user'

let createDataset
let createUser
let createOrg

createDataset = async (result) => {
  const { identity, properties } = result.owner
  const owner = createOrg({ id: identity, name: properties.name })

  const columns = result.columns
    .map(c => ({ id: c.identity, ...c.properties }))
    .sort((a, b) => a.order > b.order)

  const dataset = new Dataset(result.id, result.name, result.path, owner, result.computed,
    result.generating, columns)

  return dataset
}

createUser = (result) => {
  let orgs = []

  if (result.orgs) {
    orgs = result.orgs.map(org => createOrg({ id: org.identity, ...org.properties }))
  }

  return new User(result.id, result.username, result.password, orgs, result.apikey)
}

createOrg = (result) => {
  let members = []

  if (result.users) {
    members = result.users.map(user => createUser({ id: user.id, ...user.info }))
  }

  const org = new Organization(result.id, result.name, members)

  return org
}

export default {
  createUser,
  createOrg,
  createDataset
}
