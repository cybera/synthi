import { AuthenticationError } from 'apollo-server-express'

import { findOrganization } from './util'
import { ModelFactory } from '../models'
import Query from '../../neo4j/query'

import logger from '../../config/winston'

// eslint-disable-next-line import/prefer-default-export
export async function createTransformationTemplate(name, inputs, code, owner, user, tagNames) {
  const org = await findOrganization(owner)

  if (!await org.canCreateTransformationTemplates(user)) {
    throw new AuthenticationError('You cannot create transformations for this organization')
  }

  const transformation = await org.createTransformationTemplate(name, inputs, code, tagNames)

  logger.debug('%o', transformation)

  return transformation
}

export async function updateTransformation(uuid, { name, inputs, code, tagNames }) {
  const transformation = await ModelFactory.getByUuid(uuid)
  transformation.name = name || transformation.name
  transformation.inputs = inputs || transformation.inputs
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

export async function transformations(orgRef, filter={}) {
  const org = await findOrganization(orgRef)
  const transformations = await org.transformations()
  const { publishedOnly, includeShared } = filter

  let filteredTransformations = transformations

  if (publishedOnly) {
    filteredTransformations = transformations.filter(transformation => transformation.published)
  }

  if (includeShared) {
    const otherPublished = new Query('transformation')
    otherPublished.addPart(`
      MATCH (organization:Organization)
      WHERE (organization.name <> $org.name OR $org.name IS NULL) AND
            (organization.uuid <> $org.uuid OR $org.uuid IS NULL) AND
            (ID(organization)  <> $org.id   OR $org.id IS NULL)
      MATCH (organization)-[:OWNER]->(transformation:Transformation { published: true })
    `)
    const otherTransformations = await otherPublished.run({ org: orgRef })
    filteredTransformations.push(...otherTransformations)
  }

  return filteredTransformations
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
