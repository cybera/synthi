import 'dotenv/config'

import { apolloUploadExpress } from 'apollo-upload-server'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'

import express from 'express'

import schema from './graphql/schema'
import cors from 'cors'

const app = express()

app.use(cors())

app.use(
  '/graphql', 
  bodyParser.json(),
  apolloUploadExpress(), 
  graphqlExpress({schema})
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

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