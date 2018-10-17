import 'dotenv/config'

import http from 'http'

import bodyParser from 'body-parser'

import express from 'express'

import { ApolloServer, ForbiddenError } from 'apollo-server-express'

import cors from 'cors'

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import session from 'express-session'

import morgan from 'morgan'

import onExit from 'signal-exit'

import resolvers from './graphql/resolvers'
import typeDefs from './graphql/typedefs'
import { ensureDatasetExists, waitForFile } from './lib/util'
import { startDatasetStatusConsumer } from './lib/queue'
import UserRepository from './domain/repositories/userRepository'
import DatasetRepository from './domain/repositories/datasetRepository'

const RedisStore = require('connect-redis')(session)

const app = express()

app.use(cors())

// Serve compiled version of the client from the server app's
// dist directory (if it exists)
// app.use(express.static("dist"))

const authenticateUser = async (username, password) => {
  const user = await UserRepository.getByUsername(username)
  if (!user) {
    return false
  }
  const valid = await user.validPassword(password)
  return valid ? user : false
}

// Authentication w/ passportjs
passport.use(new LocalStrategy(
  (username, password, done) => {
    console.log(`here: ${username}/${password}`)
    authenticateUser(username, password)
      .then(result => done(null, result))
      .catch((err) => { console.log(err.message); done(err) })
  }
));

passport.serializeUser((user, done) => {
  console.log(`serializeUser: ${user.id}`)
  done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  console.log(`deserializeUser: ${id}`)
  let user
  try {
    user = await UserRepository.get(id)
    if (!user) {
      return done(new Error('User not found'))
    }
  } catch (err) {
    return done(err)
  }
  return done(null, user)
})

app.use(morgan('combined'))
// Apollo doesn't need bodyParser anymore, but this seems like it's still needed for
// logging in.
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  store: new RedisStore({ host: 'redis', port: 6379 }),
  secret: 'secret-token-123456',
  resave: false
}))
app.use(passport.initialize())
app.use(passport.session())

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // TODO: Actual websocket authentication
    if (req) {
      const { user } = req
      if (!user) throw new ForbiddenError('Not logged in')
      return { user }
    }
    return ({})
  },
  formatError: (error) => {
    console.log(error)
    return error
  }
})

// This needs to come after the passport middleware
apolloServer.applyMiddleware({ app })

app.post('/login',
  passport.authenticate('local'),
  (req, res) => res.json({ user: req.user.username }))

app.get('/logout', (req, res) => { req.logout(); res.send('Logged out') })

app.get('/whoami', (req, res) => {
  if (req.user) {
    res.send(req.user.username)
  } else {
    res.send('not logged in')
  }
})

app.get('/dataset/:id', async (req, res) => {
  let dataset =  await DatasetRepository.get(req.params.id)

  ensureDatasetExists(dataset)

  await waitForFile(dataset.path).catch(err => console.log(err))

  res.download(dataset.fullPath(), `${dataset.name}.csv`, (err) => res.send(err))
})

const httpServer = http.createServer(app)
apolloServer.installSubscriptionHandlers(httpServer)

// run server on port 3000
const PORT = 3000
const server = httpServer.listen(PORT, err => {
  if (err) {
    console.log(err)
  }
  console.log(`Server ready at http://server:${PORT}${apolloServer.graphqlPath}`)
  console.log(`Subscriptions ready at ws://server:${PORT}${apolloServer.subscriptionsPath}`)
})

const queueConnection = startDatasetStatusConsumer()
console.log('after')
// Close all connections on shutdown
onExit(function (code, signal) {
  console.log("Shutting down...")
  server.close()
  queueConnection.close()
}, { alwaysLast: true })
