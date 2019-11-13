import { rule } from 'graphql-shield'

import logger from '../config/winston'

import { ModelFactory } from '../domain/models'
import { findOrganization } from '../domain/contexts/util'

function normalizeToOrganizationRef(args, organizationRefField, organizationUUIDField) {
  if (organizationRefField) {
    return args[organizationRefField] || (
      parent ? parent[organizationRefField] : undefined
    )
  } else if (organizationUUIDField) {
    return {
      uuid: args[organizationUUIDField] || (
        parent ? parent[organizationUUIDField] : undefined
      )
    }
  }

  return null
}

async function organizationFromArgs(args, organizationRefField, organizationUUIDField) {
  const organizationRef = normalizeToOrganizationRef(args, organizationRefField, organizationUUIDField)

  // TODO: Can the query/type-field be found in info (add to debug msg)
  logger.debug('checking isMember for OrganizationRef: %o', organizationRef)

  if (organizationRef) {
    return findOrganization(organizationRef)
  }

  return null
}

export const isMember = ({
  organizationRef: organizationRefField,
  organizationUUID: organizationUUIDField
}) => (
  rule({ cache: 'strict' })(
    async (parent, args, ctx /* , info */) => {

      const organization = await organizationFromArgs(args, organizationRefField, organizationUUIDField)
      if (organization) return organization.canAccess(ctx.user)

      return false
    }
  )
)

export const memberCanCreateDatasets = ({
  organizationRef: organizationRefField,
  organizationUUID: organizationUUIDField
}) => (
  rule({ cache: 'strict' })(
    async (parent, args, ctx /* , info */) => {

      const organization = await organizationFromArgs(args, organizationRefField, organizationUUIDField)
      if (organization) return organization.canCreateDatasets(ctx.user)

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

export const isPublished = ({ uuid: uuidField, published: publishedField } = { uuid: 'uuid', published: 'published' }) => (
  rule({ cache: 'strict' })(
    async (parent, args, /* ctx, info */) => {
      const uuid = args[uuidField] || (parent ? parent[uuidField] : undefined)

      logger.debug(`checking isOwner for uuid: ${uuid}`)

      if (uuid) {
        const obj = await ModelFactory.getByUuid(uuid)
        return obj[publishedField]
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
