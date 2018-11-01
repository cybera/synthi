import { sendToWorkerQueue } from '../../lib/queue'
import { safeQuery } from '../../neo4j/connection'
import { storeFS, runTransformation } from '../../lib/util'
import { pubsub, withFilter } from '../pubsub'
import * as TransformationRepository from '../../domain/repositories/transformationRepository'
import DatasetRepository from '../../domain/repositories/datasetRepository'
import OrganizationRepository from '../../domain/repositories/organizationRepository'

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
  let dataset = await DatasetRepository.get(context, id)

  if (file) {
    const { stream, filename } = await file
    const { path } = await storeFS({ stream, filename })

    try {
      dataset.path = path
      dataset.computed = false

      await DatasetRepository.save(context, dataset)
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
    await DatasetRepository.save(context, dataset)
  }

  return dataset
}

const DATASET_UPDATED = 'DATASET_UPDATED'

export default {
  Query: {
    async dataset(_, { id, name, searchString }, context) {
      let datasets = []

      if (id != null) datasets.push(await DatasetRepository.get(context, id))
      else if (name != null) datasets.push(await DatasetRepository.getByName(context, name))
      else datasets = await DatasetRepository.getAll(context, searchString)

      return datasets
    },
  },
  Dataset: {
    async columns(dataset) {
      return dataset.columns.map(c => ({ ...c, visible: columnVisible(c) }))
    },
    async samples(dataset) {
      return dataset.samples()
    },
    async rows(dataset) {
      return dataset.rows()
    },
    inputTransformation(dataset) {
      return TransformationRepository.inputTransformation(dataset)
    },
    async connections(dataset) {
      const results = await DatasetRepository.datasetConnections(dataset)
      return results
    }
  },
  Mutation: {
    async createDataset(_, { name, owner }, context) {
      const org = await OrganizationRepository.get(owner)
      return DatasetRepository.create(context, { name, owner: org })
    },
    async deleteDataset(_, { id }, context) {
      return DatasetRepository.delete(context, id)
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
      const dataset = await DatasetRepository.get(context, id)
      dataset.generating = true
      await DatasetRepository.save(context, dataset)
      runTransformation(context.user, dataset)
      return dataset
    },
    toggleColumnVisibility(_, { id }) {
      const isVisible = columnVisible({ id })
      visibleColumnCache[id].visible = !isVisible
      return visibleColumnCache[id].visible
    },
    async saveInputTransformation(_, { id, code }, context) {
      const dataset = await DatasetRepository.get(context, id)
      return TransformationRepository.saveInputTransformation(dataset, code)
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
