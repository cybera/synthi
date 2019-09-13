import {
  createTransformationTemplate
} from '../../domain/contexts/transformation'

import { isMember, isOwner } from '../rules'

export const resolvers = {
  Transformation: {
    code: transformation => transformation.code(),
    virtual: transformation => (transformation.virtual ? transformation.virtual : false)
  },
  Mutation: {
    createTransformationTemplate: (_, {
      name,
      inputs,
      code,
      owner
    }, { user }) => createTransformationTemplate(name, inputs, code, owner, user)
  }
}

export const permissions = {
  Transformation: {
    '*': isOwner()
  },
  Mutation: {
    createTransformationTemplate: isMember({ organizationID: 'owner' })
  }
}
