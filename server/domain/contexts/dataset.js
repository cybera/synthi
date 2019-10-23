import { AuthenticationError } from 'apollo-server-express'

import {
  Dataset,
  Organization,
  Column,
  ModelFactory,
} from '../models'

import {
  findOrganization,
  findTransformation,
  findTransformationInputs,
  debugTransformationInputObjs
} from './util'

import Query from '../../neo4j/query'
import logger from '../../config/winston'

export async function updateDatasetMetadata(datasetUuid, metadata) {
  const dataset = await Dataset.getByUuid(datasetUuid)
  await dataset.updateMetadata(metadata)
  return metadata
}

export async function processDatasetUpdate(uuid, datasetProps) {
  const {
    file,
    computed,
    name,
    generating
  } = datasetProps

  // TODO: access control
  const dataset = await ModelFactory.getByUuid(uuid)

  if (file) {
    /*
      This is so important I'm leaving it in two lines and adding this big comment. There's a part
      in the "Tips" section of graphql-upload that's easy to miss the significance of: "Promisify
      and await file upload streams in resolvers or the server will send a response to the client
      before uploads are complete, causing a disconnect." Here's the link to that section:

      https://github.com/jaydenseric/graphql-upload#tips

      I moved some of the original upload handling that was more focused on stream handling (as
      opposed to *getting* the stream, filename, etc.), which is in the first line. This makes
      it easier to handle uploads consistently for datasets, putting logic for picking storage
      devices, etc. outside of the resolver. This is good. However, it does make the code less
      like the example code for graphql-upload. There's an 'await' call from that example now
      tucked away in dataset.upload. It's theoretically doing what that tip points out. And,
      within that function, everything's being done properly. However, back in *this* resolver,
      we now have to really make sure we await dataset.upload. Otherwise this resolver will
      return way too soon for a larger file, even if the code in the upload function is handling
      promises properly.

      What are the consequences of not awaiting the dataset.upload function? Well, seemingly
      weird behaviour, where smaller files will usually upload alright, but larger ones (and
      by 'larger', not actually *that* large... a 1 MB file could trigger the problem depending
      on the connection speed) would simply not make it to object storage (or whatever storage)
      is being used. On the current version of the MacOS Docker client, this could ultimately
      result in needing to restart Docker. The problems in staging/production environments on
      Linux hosts seemed as you would expect: uploads of larger files simply would not work.

      However, with this simple extra await, the resolver waits properly, not disconnecting
      during upload, and larger files once again work.
    */
    const uploadInfo = await file
    await dataset.upload(uploadInfo)
  }

  let changed = false
  if (computed != null) {
    dataset.computed = computed
    changed = true
  }

  if (name != null) {
    dataset.name = name
    changed = true
  }

  if (generating != null) {
    dataset.generating = generating
    changed = true
  }

  if (changed) {
    await dataset.save()
  }

  return dataset
}

export async function filterDatasets({
  uuid,
  name,
  searchString,
  org
}) {
  let datasets = []

  if (uuid != null) {
    datasets.push(await ModelFactory.getByUuid(uuid))
  } else if (org) {
    const organization = await findOrganization(org)
    if (name) {
      datasets.push(await Dataset.getByName(organization, name))
    } else {
      datasets = await organization.datasets(searchString)
    }
  }

  return datasets
}

export async function createDataset(owner, name, type, user) {
  let datasetType = type
  if (!datasetType) {
    datasetType = 'csv'
  }

  // TODO: context.user.createDataset(org, { name })
  const org = await Organization.getByUuid(owner)
  if (!await org.canAccess(user)) {
    throw new AuthenticationError('You cannot create datasets for this organization')
  }

  if (await org.canCreateDatasets(user)) {
    const dataset = await org.createDataset({ name, type: datasetType })
    // Initialize metadata (this will set some dates to when the dataset is created)
    const metadata = await dataset.metadata()
    await metadata.save()

    return dataset
  }
  return null
}

export async function deleteDataset(uuid) {
  const dataset = await ModelFactory.getByUuid(uuid)
  await dataset.delete()
  return true
}

export async function importCSV(uuid, { removeExisting, options }) {
  const dataset = await ModelFactory.getByUuid(uuid)
  // Only allow importing if the user can access the dataset in the first place
  if (dataset) {
    dataset.importCSV(removeExisting, options)
  }
  return dataset
}

export async function generateDataset(uuid, user) {
  const dataset = await ModelFactory.getByUuid(uuid)
  dataset.generating = true
  await dataset.save()
  dataset.runTransformation(user)
  return dataset
}

export async function toggleColumnVisibility(columnUuid, user) {
  const column = await Column.getByUuid(columnUuid)
  const visible = await column.visibleForUser(user)
  return column.setVisibleForUser(!visible, user)
}

export async function saveInputTransformation(datasetUuid, {
  code,
  template,
  inputs,
  org
}, user) {
  const dataset = await ModelFactory.getByUuid(datasetUuid)
  if (code && !template && !inputs) {
    return dataset.saveInputTransformation(code, user)
  } else if (!code && template && inputs) {
    const templateObj = await findTransformation(template, org)
    const inputObjs = await findTransformationInputs(inputs, org)

    logger.debug(`Transformation Ref: ${templateObj.name} (${templateObj.uuid})`)
    logger.debug(`Inputs: {\n${debugTransformationInputObjs(inputObjs)}\n}`)

    return dataset.saveInputTransformationRef(templateObj, inputObjs)
  }

  throw Error('Please provide either code or a transformation reference and inputs')
}

export async function updateColumn(columnUuid, values, tagNames) {
  const column = await Column.getByUuid(columnUuid)
  return column.update(values, tagNames)
}

export async function setPublished(uuid, published) {
  const dataset = await ModelFactory.getByUuid(uuid)
  dataset.published = published
  await dataset.save()
  return dataset
}

export async function listDatasets(orgRef, filter={}) {
  const query = new Query('dataset')

  query.addPart('MATCH (organization:Organization)-[:OWNER]->(dataset:Dataset)')

  // organization/dataset filtering
  query.addPart(({ filter }) => {
    const { includeShared, publishedOnly } = filter

    let where
    if (includeShared && publishedOnly) {
      // If we include datasets from other organizations and only want published ones,
      // then we don't bother adding a restriction to a specific organization.
      where = 'WHERE dataset.published = true'
    } else {
      // We're going to need to restrict to the given organization at this point
      where = `WHERE (
        ($org.name IS NOT NULL AND organization.name = $org.name) OR 
        ($org.uuid IS NOT NULL AND organization.uuid = $org.uuid) OR 
        ($org.id   IS NOT NULL AND ID(organization)  = $org.id))
      `

      if (publishedOnly) {
        where += 'AND dataset.published = true'
      } else if (includeShared) {
        where += 'OR dataset.published = true'
      }
    }

    return where
  })

  // metadata filtering
  query.addPart(({ filter }) => {
    let conditions = []
    if (filter.format) {
      conditions.push('metadata.format = $filter.format')
    }
    
    if (conditions.length > 0) {
      return `
        MATCH (dataset)-[:HAS_METADATA]->(metadata:DatasetMetadata)
        WHERE ${conditions.join(' AND \n')}
      `
    }

    return ''
  })

  return query.run({ org: orgRef, filter })
}
