import { AuthenticationError } from 'apollo-server-express'

import { safeQuery } from '../../neo4j/connection'
import { pubsub, withFilter } from '../pubsub'
import Organization from '../../domain/models/organization'
import { Dataset, ModelFactory } from '../../domain/models'
import {
  findOrganization,
  findTransformation,
  findTransformationInputs,
  debugTransformationInputObjs
} from '../util'
import logger from '../../config/winston';

// TODO: Move this to the column model and use redis to store
const visibleColumnCache = {}

const columnVisible = (user, { id, order }) => {
  if (!visibleColumnCache[user.uuid]) {
    visibleColumnCache[user.uuid] = {}
  }

  if (!visibleColumnCache[user.uuid][id]) {
    visibleColumnCache[user.uuid][id] = { visible: order ? order < 5 : false }
  }
  return visibleColumnCache[user.uuid][id].visible
}

const processDatasetUpdate = async (datasetProps, context) => {
  const {
    id,
    file,
    computed,
    name,
    generating
  } = datasetProps

  // TODO: access control
  const dataset = await ModelFactory.get(id)

  if (!dataset.canAccess(context.user)) {
    throw new AuthenticationError('Operation not allowed on this resource')
  }

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

const DATASET_UPDATED = 'DATASET_UPDATED'

export default {
  Query: {
    async dataset(_, {
      id,
      name,
      searchString,
      org
    }, context) {
      let datasets = []

      if (id != null) {
        datasets.push(await ModelFactory.get(id))
      } else if (org) {
        const organization = await findOrganization(org, context.user)
        if (name) {
          datasets.push(await Dataset.getByName(organization, name))
        } else {
          datasets = await organization.datasets(searchString)
        }
      }

      return datasets
    },
  },
  Dataset: {
    async columns(dataset, _, context) {
      const columns = await dataset.columns()
      return columns.map(c => ({ ...c, visible: columnVisible(context.user, c) }))
    },
    samples: dataset => dataset.samples(),
    rows: dataset => dataset.rows(),
    owner: dataset => dataset.owner(),
    inputTransformation: dataset => dataset.inputTransformation(),
    connections: dataset => dataset.connections()
  },
  Mutation: {
    async createDataset(_, { name, owner, type }, context) {
      let datasetType = type
      if (!datasetType) {
        datasetType = 'csv'
      }

      // TODO: context.user.createDataset(org, { name })
      const org = await Organization.get(owner)
      if (!await org.canAccess(context.user)) {
        throw new AuthenticationError('You cannot create datasets for this organization')
      }

      if (await org.canCreateDatasets(context.user)) {
        const dataset = await org.createDataset({ name, type: datasetType })
        // Initialize metadata (this will set some dates to when the dataset is created)
        const metadata = await dataset.metadata()
        await metadata.save()

        return dataset
      }
      return null
    },
    async deleteDataset(_, { id }, context) {
      const dataset = await ModelFactory.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      await dataset.delete()
      return dataset
    },
    async importCSV(_, { id, removeExisting, options }, context) {
      const dataset = await ModelFactory.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      // Only allow importing if the user can access the dataset in the first place
      if (dataset) {
        dataset.importCSV(removeExisting, options)
      }
      return dataset
    },
    updateDataset: (_, props, context) => processDatasetUpdate(props, context),
    createPlot(_, { jsondef }) {
      return safeQuery(`
        CREATE (p:Plot { jsondef: $jsondef })
        RETURN ID(p) AS id, p.jsondef AS jsondef
      `,
      { jsondef }).then(results => results[0])
    },
    async generateDataset(_, { id }, context) {
      const dataset = await ModelFactory.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      dataset.generating = true
      await dataset.save()
      dataset.runTransformation()
      return dataset
    },
    toggleColumnVisibility(_, { id }, context) {
      const isVisible = columnVisible(context.user, { id })
      visibleColumnCache[context.user.uuid][id].visible = !isVisible
      return visibleColumnCache[context.user.uuid][id].visible
    },
    async saveInputTransformation(_, {
      id,
      code,
      template,
      inputs,
      org
    }, context) {
      const dataset = await ModelFactory.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }

      if (code && !template && !inputs) {
        return dataset.saveInputTransformation(code, context.user)
      } else if (!code && template && inputs) {
        const templateObj = await findTransformation(template, org, context.user)
        const inputObjs = await findTransformationInputs(inputs, org, context.user)

        logger.debug(`Transformation Ref: ${templateObj.name} (${templateObj.uuid})`)
        logger.debug(`Inputs: {\n${debugTransformationInputObjs(inputObjs)}\n}`)

        return dataset.saveInputTransformationRef(templateObj, inputObjs)
      }

      throw Error('Please provide either code or a transformation reference and inputs')
    }
  },
  Subscription: {
    datasetGenerated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([DATASET_UPDATED]),
        (payload, variables) => payload.datasetGenerated.id === variables.id
      )
    },
  }
}
