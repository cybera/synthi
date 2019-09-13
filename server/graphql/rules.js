import { rule } from 'graphql-shield'

import logger from '../config/winston'

import { ModelFactory } from '../domain/models'
import { findOrganization } from '../domain/contexts/util'

export const isMember = ({
  organizationID: organizationIDField,
  organizationUUID: organizationUUIDField
}) => (
  rule({ cache: 'strict' })(
    async (parent, args, ctx /* , info */) => {
      let organizationID
      if (organizationIDField) {
        organizationID = args[organizationIDField] || (
          parent ? parent[organizationIDField] : undefined
        )
      } else if (organizationUUIDField) {
        organizationID = {
          uuid: args[organizationUUIDField] || (
            parent ? parent[organizationUUIDField] : undefined
          )
        }
      }
      // TODO: Can the query/type-field be found in info (add to debug msg)
      logger.debug('checking isMember for OrganizationID: %o', organizationID)

      if (organizationID) {
        const organization = await findOrganization(organizationID)
        return organization.canAccess(ctx.user)
      }

      return false
    }
  )
)


export const isOwner = ({ uuid: uuidField } = { uuid: 'uuid' }) => (
  rule({ cache: 'strict' })(
    async (parent, args, ctx /* , info */) => {
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

export const isCurrentUser = rule({ cache: 'strict' })(
  async (parent, args, { user } /* , info */) => {
    const uuid = args.uuid || parent.uuid
    return uuid === user.uuid
  }
)
