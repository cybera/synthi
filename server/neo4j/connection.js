const neo4j = require('neo4j-driver').v1

const neo4jConnection = new neo4j.driver(
  `${process.env.NEO4J_PROTOCOL}://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
  { disableLosslessIntegers: true })

module.exports = neo4jConnection