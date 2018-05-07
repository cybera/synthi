require('dotenv').config()

const express = require('express')

const graphqlHTTP = require('express-graphql')
const neo4j = require('./neo4j/connection')
const schema = require('./graphql/schema/Schema')

const app = express()

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

app.get('/', (req, res) => res.send("Hello world !"))

// run server on port 3000
const server = app.listen('3000', _ => console.log('Server is listening on port 3000...'))

// Close all connections on shutdown
const shutdown = function () {
  console.log("Shutting down...")
  neo4j.close()
  server.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)