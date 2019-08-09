import { AuthenticationError } from 'apollo-server-express'

import { findOrganization } from '../util'
import logger from '../../config/winston'

export default {
  Transformation: {
    code(transformation) {
      return transformation.code()
    }
  },
  Mutation: {
    async createTransformationTemplate(_, {
      name,
      inputs,
      code,
      owner
    }, context) {
      const org = await findOrganization(owner)
      if (!await org.canAccess(context.user)) {
        throw new AuthenticationError('You cannot access this organization')
      }

      if (!await org.canCreateTransformations(context.user)) {
        throw new AuthenticationError('You cannot create transformations for this organization')
      }

      const transformation = await org.createTransformation(name, inputs, code)

      logger.debug('%o', transformation)

      return transformation
    }
  }
}
