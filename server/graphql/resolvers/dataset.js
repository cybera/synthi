import { AuthenticationError } from 'apollo-server-express'

import { safeQuery } from '../../neo4j/connection'
import { pubsub, withFilter } from '../pubsub'
import * as TransformationRepository from '../../domain/repositories/transformationRepository'
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

const processDatasetUpdate = async (datasetProps, context) => {
  const {
    id,
    file,
    computed,
    name
  } = datasetProps

  // TODO: access control
  const dataset = await Dataset.get(id)

  if (!dataset.canAccess(context.user)) {
    throw new AuthenticationError('Operation not allowed on this resource')
  }

  if (file) dataset.upload(await file)

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
        return org.createDataset({ name })
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
      const dataset = await Dataset.get(id)
      if (!await dataset.canAccess(context.user)) {
        throw new AuthenticationError('Operation not allowed on this resource')
      }
      dataset.generating = true
      await dataset.save()
      dataset.runTransformation()
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
