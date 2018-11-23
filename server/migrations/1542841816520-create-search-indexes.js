import { safeQuery } from '../neo4j/connection'

module.exports.up = async (next) => {
  await safeQuery(`CALL apoc.index.addAllNodes("DefaultDatasetSearchIndex", {
    DatasetMetadata: ["title", "contributor", "contact", "description", "source", "identifier", "theme"],
    Column: ["name"],
    Dataset: ["name"]
    }, { autoUpdate: true })`)
  next()
}

module.exports.down = async (next) => {
  await safeQuery('CALL apoc.index.remove("DefaultDatasetSearchIndex")')
  next()
}
