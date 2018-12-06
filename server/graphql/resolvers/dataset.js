import { AuthenticationError } from 'apollo-server-express'

import { sendToWorkerQueue } from '../../lib/queue'
import { safeQuery } from '../../neo4j/connection'
import { storeFS, runTransformation } from '../../lib/util'
import { pubsub, withFilter } from '../pubsub'
import * as TransformationRepository from '../../domain/repositories/transformationRepository'
import DatasetRepository from '../../domain/repositories/datasetRepository'
import Organization from '../../domain/models/organization'
import Dataset from '../../domain/models/dataset'

// TODO: Move this to a real memcached or similar service and actually tie it to the
// current user
const visibleColumnCache = {}

const columnVisible = ({ id, order }) => {
  if (!visibleColumnCache[id]) {
    visibleColumnCache[id] = { visible: order ? order < 5 : false }
  }
  return visibleColumnCache[id].visible
}

const processDatasetUpload = async (name, upload, context) => {
  const { stream, filename } = await upload
  const { path } = await storeFS({ stream, filename })
  let dataset

  try {
    dataset = await DatasetRepository.create(context, { name, path, computed: false })

    sendToWorkerQueue({
      task: 'import_csv',
      id: dataset.id
    })
  } catch (e) {
    // TODO: What should we do here?
    console.log(e.message)
  }

  return dataset
}

const processDatasetUpdate = async (datasetProps, context) => {
  const { id, file, computed, name } = datasetProps

  // TODO: access control
  let dataset = await Dataset.get(id)

  if (!dataset.canAccess(context.user)) {
    throw new AuthenticationError('Operation not allowed on this resource')
  }

  if (file) {
    const { stream, filename } = await file
    const { path } = await storeFS({ stream, filename })

    try {
      dataset.path = path
      dataset.computed = false

      await dataset.save()
      sendToWorkerQueue({
        task: 'import_csv',
        id: dataset.id
      })
    } catch (e) {
      // TODO: What should we do here?
      console.log(e.message)
    }
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

  if (changed) {
    await dataset.save()
  }

  return dataset
}

const DATASET_UPDATED = 'DATASET_UPDATED'

const findOrganization = async (org) => {
  if (!org) return null

  const { id, uuid, name } = org

  if (typeof uuid !== 'undefined') {
    return Organization.getByUuid(uuid)
  }

  if (typeof id !== 'undefined') {
    return Organization.get(org.id)
  }

  if (typeof name !== 'undefined') {
    return Organization.getByName(org.name)
  }

  return null
}

export default {
  Query: {
    async dataset(_, { id, name, searchString, org }, context) {
      let datasets = []

      const organization = await findOrganization(org)

      if (id != null) datasets.push(await Dataset.get(id))
      else if (name != null) datasets.push(await Dataset.getByName(organization, name))
      else datasets = await organization.datasets(searchString)

      return datasets
    },
  },
  Dataset: {
    async columns(dataset) {
      const columns = await dataset.columns()
      return columns.map(c => ({ ...c, visible: columnVisible(c) }))
    },
    samples: dataset => dataset.samples(),
    rows: dataset => dataset.rows(),
    owner: dataset => dataset.owner(),
    inputTransformation: dataset => dataset.inputTransformation(),
    connections: dataset => dataset.connections()
  },
  Mutation: {
    async createDataset(_, { name, owner }, context) {
      // TODO: context.user.createDataset(org, { name })
      const org = await Organization.get(owner)
      if (!await org.canAccess(context.user)) {
        throw new AuthenticationError('You cannot create datasets for this organization')
      }

      if (await org.canCreateDatasets(context.user)) {
        const dataset = await org.createDataset({ name })
        // Initialize metadata (this will set some dates to when the dataset is created)
        const metadata = await dataset.metadata()
        await metadata.save()

        return dataset
      }
      return null
    },
    async deleteDataset(_, { id }, context) {
      const dataset = await Dataset.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      await dataset.delete()
      return dataset
    },
    async importCSV(_, { id, removeExisting, options }, context) {
      const dataset = await Dataset.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      // Only allow importing if the user can access the dataset in the first place
      if (dataset) {
        sendToWorkerQueue({
          task: 'import_csv',
          id,
          removeExisting,
          ...options
        })
      }
      return dataset
    },
    uploadDataset: (_, { name, file }, context) => processDatasetUpload(name, file, context),
    updateDataset: (_, props, context) => processDatasetUpdate(props, context),
    createPlot(_, { jsondef }) {
      return safeQuery(`
        CREATE (p:Plot { jsondef: $jsondef })
        RETURN ID(p) AS id, p.jsondef AS jsondef
      `,
      { jsondef }).then(results => results[0])
    },
    async generateDataset(_, { id }, context) {
      const dataset = await Dataset.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      dataset.generating = true
      await dataset.save()
      runTransformation(dataset)
      return dataset
    },
    toggleColumnVisibility(_, { id }) {
      const isVisible = columnVisible({ id })
      visibleColumnCache[id].visible = !isVisible
      return visibleColumnCache[id].visible
    },
    async saveInputTransformation(_, { id, code }, context) {
      const dataset = await Dataset.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      return TransformationRepository.saveInputTransformation(context, dataset, code)
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
