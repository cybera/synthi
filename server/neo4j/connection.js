import config from 'config'

const neo4j = require('neo4j-driver').v1

const connectionInfo = config.get('neo4j')
const neo4jConnection = new neo4j.driver( // eslint-disable-line new-cap
  connectionInfo.url,
  neo4j.auth.basic(connectionInfo.username, connectionInfo.password),
  { disableLosslessIntegers: true }
)

const safeQuery = (query, params) => {
  const session = neo4jConnection.session()

  return session.run(query, params).then(result => (
    result.records.map(record => record.toObject())
  )).catch((e) => {
    console.log(e)
    return []
  }).then((result) => {
    session.close()
    return result
  })
}

export { safeQuery }
export default neo4jConnection
