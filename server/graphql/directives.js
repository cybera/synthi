import {
  SchemaDirectiveVisitor,
  AuthenticationError
} from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'

/* eslint-disable class-methods-use-this */
class AuthCanAccessDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
  }

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._fieldsWrapped) return

    objectType._fieldsWrapped = true

    const fields = objectType.getFields()

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName]
      const { resolve = defaultFieldResolver } = field
      async function protectedResolver(...args) {
        const [ obj, source, ctx, info ] = args
        const result = await resolve.apply(this, args)
        if (!(await obj.canAccess(ctx.user, field.name))) {
          throw new AuthenticationError(`Access not allowed for: ${field.name}`)
        }

        return result
      }
      field.resolve = protectedResolver
    })
  }
}
/* eslint-enable class-methods-use-this */

const schemaDirectives = {
  authCanAccess: AuthCanAccessDirective
}

export default schemaDirectives
