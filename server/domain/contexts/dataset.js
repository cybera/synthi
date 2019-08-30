import { Dataset } from '../models'

export async function updateDatasetMetadata(datasetUuid, metadata) {
  const dataset = await Dataset.getByUuid(datasetUuid)
  await dataset.updateMetadata(metadata)
  return metadata
}
