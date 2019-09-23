import { AuthenticationError } from 'apollo-server-express'

import { findOrganization } from './util'
import { ModelFactory } from '../models'

import logger from '../../config/winston'

// eslint-disable-next-line import/prefer-default-export
export async function createTransformationTemplate(name, inputs, code, owner, user) {
  const org = await findOrganization(owner)

  if (!await org.canCreateTransformationTemplates(user)) {
    throw new AuthenticationError('You cannot create transformations for this organization')
  }

  const transformation = await org.createTransformationTemplate(name, inputs, code)

  logger.debug('%o', transformation)

  return transformation
}

export async function deleteTransformation(uuid) {
  const transformation = await ModelFactory.getByUuid(uuid)
  await transformation.delete()
  return true
}

export async function transformations(orgRef) {
  const org = await findOrganization(orgRef)
  return org.transformations()
}

export async function transformation(uuid, name, orgRef) {
  if (uuid) {
    return ModelFactory.getByUuid(uuid)
  }

  if (name) {
    const org = await findOrganization(orgRef)
    return org.transformationTemplateByName(name)
  }

  return null
}