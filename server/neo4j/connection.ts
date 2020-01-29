import config from 'config'
import logger from '../config/winston'

import _neo4j = require('neo4j-driver')
const neo4j = _neo4j.v1

interface Neo4jConfig {
  url: string
  username: string
  password: string
}

interface Indexable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any
}

const connectionInfo: Neo4jConfig = config.get('neo4j')
const neo4jConnection = neo4j.driver(
  connectionInfo.url,
  neo4j.auth.basic(connectionInfo.username, connectionInfo.password),
  { disableLosslessIntegers: true }
)

const safeQuery = async (query: string, params: object): Promise<Indexable[]> => {
  const session = neo4jConnection.session()
  let records: object[] = []

  try {
    const result = await session.run(query, params)
    records = result.records.map(record => record.toObject())
  } catch (err) {
    logger.error(err)
  } finally {
    await session.close()  
  }

  return records
}

export { safeQuery, neo4j, Indexable }
export default neo4jConnection
