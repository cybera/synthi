import DatasetRepository from '../../domain/repositories/datasetRepository'
import { sendToWorkerQueue } from '../../lib/queue'
import { safeQuery } from '../../neo4j/connection'
import { storeFS, runTransformation } from '../../lib/util'
import { pubsub, withFilter } from '../pubsub'

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

const DATASET_UPDATED = 'DATASET_UPDATED'

export default {
  Query: {
    dataset(_, { id, name }, context) {
      let datasets = []

      if (id != null) datasets.push(DatasetRepository.get(context, id))
      else if (name != null) datasets.push(DatasetRepository.getByName(context, name))
      else datasets = DatasetRepository.getAll(context)

      return datasets
    },
  },
  Dataset: {
    async columns(dataset) {
      return dataset.columns.map(c => ({ ...c, visible: columnVisible(c) }))
    },
    samples(dataset) {
      return dataset.samples()
    },
    rows(dataset) {
      return dataset.rows()
    }
  },
  Mutation: {
    createDataset(_, { name }, context) {
      return DatasetRepository.create(context, { name })
    },
    async deleteDataset(_, { id }, context) {
      DatasetRepository.delete(context, id)
    },
    uploadDataset: (_, { name, file }, context) => processDatasetUpload(name, file, context),
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
      runTransformation(dataset)
      return dataset
    },
    toggleColumnVisibility(_, { id }) {
      const isVisible = columnVisible({ id })
      visibleColumnCache[id].visible = !isVisible
      return visibleColumnCache[id].visible
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
