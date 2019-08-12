import { Organization, Dataset, ModelFactory } from '../domain/models'

const getOrgUUID = async (orgRef) => {
  let orgUUID = orgRef.uuid
  if (!orgUUID) {
    const org = await findOrganization(orgRef)
    orgUUID = org.uuid
  }
  return orgUUID
}

export const findOrganization = async (orgRef) => {
  if (!orgRef) return null

  const { id, uuid, name } = orgRef

  if (typeof uuid !== 'undefined') {
    return Organization.getByUuid(uuid)
  }

  if (typeof id !== 'undefined') {
    return Organization.get(id)
  }

  if (typeof name !== 'undefined') {
    return Organization.getByName(name)
  }

  return null
}

const findRef = async (ref, orgRef, label) => {
  const { id, uuid, name } = ref

  if (typeof uuid !== 'undefined') {
    return ModelFactory.getByUuid(uuid)
  }

  if (typeof id !== 'undefined') {
    return ModelFactory.get(id)
  }

  if (typeof name !== 'undefined') {
    const orgUUID = await getOrgUUID(orgRef)
    return ModelFactory.getByName(name, label, orgUUID)
  }

  return null
}

export const findDataset = async (ref, orgRef) => findRef(ref, orgRef, 'Dataset')
export const findTransformation = async (ref, orgRef) => findRef(ref, orgRef, 'Transformation')

export const findTransformationInputs = async (inputRefs) => {
  return Promise.all(inputRefs.map(async (inputRef) => {
    const { placeholder, dataset } = inputRef
    const datasetObj = await findDataset(dataset)
    return { placeholder, dataset: datasetObj }
  }))
}
