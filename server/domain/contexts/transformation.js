import { AuthenticationError } from 'apollo-server-express'

import { findOrganization } from './util'

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
