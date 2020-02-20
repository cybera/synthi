import Transaction from 'neo4j-driver/types/v1/transaction'

// Merge DatasetMetadata properties into Dataset
export default async function migrate(tx: Transaction): Promise<void> {
  await tx.run(`
    MATCH (dataset:Dataset)-[:HAS_METADATA]->(metadata:DatasetMetadata)
    SET dataset.title = metadata.title
    SET dataset.dateAdded = metadata.dateAdded
    SET dataset.dateCreated = metadata.dateCreated
    SET dataset.dateUpdated = metadata.dateUpdated
    SET dataset.format = metadata.format
    SET dataset.description = metadata.description
    SET dataset.ext_contributor = metadata.contributor
    SET dataset.ext_contact = metadata.contact
    SET dataset.ext_updates = metadata.updates
    SET dataset.ext_updateFrequencyAmount = metadata.updateFrequencyAmount
    SET dataset.ext_updateFrequencyUnit = metadata.updateFrequencyUnit
    SET dataset.ext_source = metadata.source
    SET dataset.ext_identifier = metadata.identifier
    SET dataset.ext_topic = metadata.topic
    DETACH DELETE metadata
  `)

  await tx.run(`
    CALL apoc.index.addAllNodes("DefaultDatasetSearchIndex", {
      Column: ["name"],
      Dataset: ["name", "title", "description", "ext_contributor", "ext_contact", "ext_source", "ext_identifier", "ext_topic"]
      }, { autoUpdate: true })
  `)
}
