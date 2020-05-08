import { AuthenticationError } from 'apollo-server-express'

import { findOrganization } from './util'
import { ModelFactory } from '../models'
import Query from '../../neo4j/query'

import logger from '../../config/winston'

// eslint-disable-next-line import/prefer-default-export
export async function createTransformationTemplate(name, description, inputs, code, owner, user, tagNames) {
  const org = await findOrganization(owner)

  if (!await org.canCreateTransformationTemplates(user)) {
    throw new AuthenticationError('You cannot create transformations for this organization')
  }

  const transformation = await org.createTransformationTemplate(name, description, inputs, code, tagNames)

  logger.debug('%o', transformation)

  return transformation
}

export async function updateTransformation(uuid, { name, description, inputs, code, tagNames }) {
  const transformation = await ModelFactory.getByUuid(uuid)
  transformation.name = name || transformation.name
  transformation.inputs = inputs || transformation.inputs
  transformation.description = description || transformation.description
  await transformation.save()

  await transformation.setTags(tagNames)

  if (code) {
    await transformation.storeCode(code)
  }

  return transformation
}

export async function deleteTransformation(uuid) {
  const transformation = await ModelFactory.getByUuid(uuid)
  await transformation.delete()
  return true
}

export async function listTransformations(orgRef, filter={}, offset=0, limit=10) {
  const query = new Query('transformation')
  const searchIndex = 'DefaultTransformationSearchIndex'

  query.addPart(({ filter }) => {
    if (filter.searchString) {
      return `
        CALL apoc.index.search($searchIndex, $filter.searchString)
        YIELD node AS searchResult
        MATCH (searchResult)-[:DESCRIBES*0..1]-(transformation:Transformation)
        MATCH (organization:Organization)-[:OWNER]->(transformation)
      `
    }
    return 'MATCH (organization:Organization)-[:OWNER]->(transformation:Transformation)'
  })

  // organization/dataset filtering
  query.addPart(({ filter }) => {
    const { includeShared, publishedOnly } = filter

    let conditions = []
    if (includeShared && publishedOnly) {
      // If we include datasets from other organizations and only want published ones,
      // then we don't bother adding a restriction to a specific organization.
      conditions.push('transformation.published = true')
    } else {
      // We're going to need to restrict to the given organization at this point
      let condition = `
        (($org.name IS NOT NULL AND organization.name = $org.name) OR 
         ($org.uuid IS NOT NULL AND organization.uuid = $org.uuid) OR 
         ($org.id   IS NOT NULL AND ID(organization)  = $org.id))
      `

      if (publishedOnly) {
        condition += 'AND transformation.published = true'
      } else if (includeShared) {
        condition += 'OR transformation.published = true'
      }

      conditions.push(`(${condition})`)
    }

    return `WHERE ${conditions.join(' AND ')}`
  })

  query.addPart(({ filter }) => {
    if (filter.tags && filter.tags.length > 0) {
      return `
        MATCH (tag:Tag)-[:DESCRIBES]->(transformation)
        WHERE tag.name IN $filter.tags
      `
    } else {
      return ''
    }
  })

  // Query for one more than we actually asked for, just to test if there ARE more
  const params = {
    org: orgRef,
    filter,
    searchIndex,
    skip: offset,
    limit: limit + 1,
    order: 'transformation.name ASC',
  }

  const transformations = await query.run(params)

  // Don't return the one extra, but last should be true if we don't get it
  return { transformations: transformations.slice(0, limit), last: transformations.length < limit + 1 }
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

export async function setPublished(uuid, published) {
  const transformation = await ModelFactory.getByUuid(uuid)
  transformation.published = published
  await transformation.save()
  return transformation
}
