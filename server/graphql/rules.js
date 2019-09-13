import { rule } from 'graphql-shield'

import logger from '../config/winston'

import { ModelFactory } from '../domain/models'
import { findOrganization } from '../domain/contexts/util'

export const isMember = fieldMap => (
  rule({ cache: 'strict' })(
    async (parent, args, ctx /* , info */) => {
      const organizationIDField = fieldMap.organizationID
      const organizationID = args[organizationIDField] || (
        parent ? parent[organizationIDField] : undefined
      )
      // TODO: Can the query/type-field be found in info (add to debug msg)
      logger.debug('checking isMember for OrganizationID: %o', organizationID)

      if (organizationID) {
        const organization = await findOrganization(organizationID, ctx.user)
        return organization.canAccess(ctx.user)
      }

      return false
    }
  )
)


export const isOwner = (fieldMap = { uuid: 'uuid' }) => (
  rule({ cache: 'strict' })(
    async (parent, args, ctx /* , info */) => {
      const uuidField = fieldMap.uuid
      const uuid = args[uuidField] || (parent ? parent[uuidField] : undefined)

      logger.debug(`checking isOwner for uuid: ${uuid}`)

      if (uuid) {
        const obj = await ModelFactory.getByUuid(uuid)
        return obj.canAccess(ctx.user)
      }

      return false
    }
  )
)
