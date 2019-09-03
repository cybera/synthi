import { AuthenticationError } from 'apollo-server-express'

import { Organization, ModelFactory } from '../models'

export const findOrganization = async (orgRef, user) => {
  const { id, uuid, name } = orgRef

  let org
  if (typeof uuid !== 'undefined') {
    org = await Organization.getByUuid(uuid)
  }

  if (typeof id !== 'undefined') {
    org = await Organization.get(id)
  }

  if (typeof name !== 'undefined') {
    org = await Organization.getByName(name)
  }

  if (!org) {
    throw new Error(`Organization for ${orgRef} does not exist`)
  }

  if (!await org.canAccess(user)) {
    throw new AuthenticationError('You cannot access this organization')
  }

  return org
}

const getOrgUUID = async (orgRef, user) => {
  let orgUUID = orgRef.uuid
  if (!orgUUID) {
    const org = await findOrganization(orgRef, user)
    orgUUID = org.uuid
  }
  return orgUUID
}

const findRef = async (ref, orgRef, user, label) => {
  const { id, uuid, name } = ref

  if (typeof uuid !== 'undefined') {
    return ModelFactory.getByUuid(uuid)
  }

  if (typeof id !== 'undefined') {
    return ModelFactory.get(id)
  }

  if (typeof name !== 'undefined') {
    const orgUUID = await getOrgUUID(orgRef, user)
    return ModelFactory.getByName(name, label, orgUUID)
  }

  return null
}

export const findDataset = async (ref, orgRef, user) => findRef(ref, orgRef, user, 'Dataset')
export const findTransformation = async (ref, orgRef, user) => findRef(ref, orgRef, user, 'Transformation')

export const findTransformationInputs = async (inputRefs, orgRef, user) => {
  return Promise.all(inputRefs.map(async (inputRef) => {
    const { alias, dataset } = inputRef
    const datasetObj = await findDataset(dataset, orgRef, user)
    return { alias, dataset: datasetObj }
  }))
}

export const debugTransformationInputObjs = inputObjs => (
  inputObjs.map(inputObj => (
    `${inputObj.alias}: ${inputObj.dataset.debugSummary()}`
  )).join('\n')
)
