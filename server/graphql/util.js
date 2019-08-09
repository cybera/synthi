import { Organization } from '../domain/models'

// eslint-disable-next-line import/prefer-default-export
export const findOrganization = async (org) => {
  if (!org) return null

  const { id, uuid, name } = org

  if (typeof uuid !== 'undefined') {
    return Organization.getByUuid(uuid)
  }

  if (typeof id !== 'undefined') {
    return Organization.get(org.id)
  }

  if (typeof name !== 'undefined') {
    return Organization.getByName(org.name)
  }

  return null
}
