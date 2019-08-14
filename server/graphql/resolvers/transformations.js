import { AuthenticationError } from 'apollo-server-express'

import { findOrganization } from '../util'
import logger from '../../config/winston'

export default {
  Transformation: {
    code(transformation) {
      return transformation.code()
    },
    virtual(transformation) {
      return transformation.virtual ? transformation.virtual : false
    }
  },
  Mutation: {
    async createTransformationTemplate(_, {
      name,
      inputs,
      code,
      owner
    }, context) {
      const org = await findOrganization(owner, context.user)

      if (!await org.canCreateTransformations(context.user)) {
        throw new AuthenticationError('You cannot create transformations for this organization')
      }

      const transformation = await org.createTransformation(name, inputs, code)

      logger.debug('%o', transformation)

      return transformation
    }
  }
}
