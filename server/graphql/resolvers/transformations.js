import {
  createTransformationTemplate
} from '../../domain/contexts/transformation'

export default {
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
