const neo4j = require('neo4j-driver').v1

const neo4jConnection = new neo4j.driver(
  `${process.env.NEO4J_PROTOCOL}://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
  { disableLosslessIntegers: true })

const safeQuery = (query, params) => {
  const session = neo4jConnection.session()

  return session.run(query, params).then(result => {
    return result.records.map(record => record.toObject())
  }).catch(e => {
    console.log(e)
    return []
  }).then(result => {
    session.close()
    return result
  })
}

export { safeQuery }
export default neo4jConnection