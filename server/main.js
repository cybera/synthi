import http from 'http'

import bodyParser from 'body-parser'

import express from 'express'

import { ApolloServer, ForbiddenError } from 'apollo-server-express'

import cors from 'cors'

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

import session from 'express-session'

import morgan from 'morgan'

import onExit from 'signal-exit'

import { graphqlUploadExpress } from 'graphql-upload'

import resolvers from './graphql/resolvers'
import typeDefs from './graphql/typedefs'
import schemaDirectives from './graphql/directives'

import logger from './config/winston'
import DefaultQueue from './lib/queue'
import User from './domain/models/user'
import Dataset from './domain/models/dataset'
import { checkConfig } from './lib/startup-checks'


// Do a config check right away to warn of any undefined configuration that we're
// expecting to be set
checkConfig()

const RedisStore = require('connect-redis')(session)

const app = express()

app.use(cors())

// Serve compiled version of the client from the server app's
// dist directory (if it exists)
app.use(express.static('dist'))

const authenticateUser = async ({ username, password, apikey }) => {
  let user
  let valid = false

  if (apikey) {
    user = await User.getByAPIKey(apikey)
    if (user) user.viaAPI = true
    valid = true
  } else {
    user = await User.getByUsername(username)
    if (user) user.viaAPI = false
    valid = user && await user.validPassword(password)
  }

  // Returning the password hash isn't good practice
  if (user) user.password = undefined
  return valid ? user : false
}

// Authentication w/ passportjs
passport.use(new LocalStrategy(
  (username, password, done) => {
    authenticateUser({ username, password })
      .then(result => done(null, result))
      .catch((err) => { logger.error(err.message); done(err) })
  }
));

passport.use(new HeaderAPIKeyStrategy(
  { header: 'Authorization', prefix: 'Api-Key ' },
  false,
  (apikey, done) => {
    authenticateUser({ apikey })
      .then(user => done(null, user))
      .catch((err) => { logger.error(err.message); done(err) })
  }
))

passport.serializeUser((user, done) => {
  logger.debug(`serializeUser: ${user.id}`)
  done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  logger.debug(`deserializeUser: ${id}`)
  let user
  try {
    user = await User.get(id)
    if (!user) {
      return done(new Error('User not found'))
    }
  } catch (err) {
    return done(err)
  }
  return done(null, user)
})

app.use(morgan('short', { stream: logger.morganStream }))
// Apollo doesn't need bodyParser anymore, but this seems like it's still needed for
// logging in.
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  store: new RedisStore({ host: 'redis', port: 6379 }),
  secret: 'secret-token-123456',
  resave: false
}))
app.use(passport.initialize())

// Normally, we'd do app.use(passport.session()) here, but passport.session() is really just
// shorthand for passport.authenticate('session'), and the passport.authenticate calls are
// really just ways of constructing authentication-oriented connect middleware. Because we
// want to support both api key authentication (for 3rd party tool integration) and session
// cookie based authentication (for regular browsing after logging in), we'll construct our
// own middleware function that chooses which authentication technique to ultimately use based
// on whether there's an authorization header.
const sessionAuthentication = passport.authenticate('session')
const apiKeyAuthentication = passport.authenticate('headerapikey', { session: false })
app.use((req, res, next) => {
  let authenticate = sessionAuthentication
  if (req.headers.authorization) {
    authenticate = apiKeyAuthentication
  }
  authenticate(req, res, next)
})

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives,
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
    logger.error(error)
    return error
  },
  // PATCH: Handle and reject parsing errors
  // See below. This is disbled until Apollo updates its version of apollo-upload-server
  // from the upstream repo.
  uploads: false
})

// PATCH: Handle and reject parsing errors
// See the following discussion:
// https://github.com/apollographql/apollo-upload-server/pull/2
// There's a critical error that can crash the server via a malformed request that
// hasn't been patched yet in Apollo Server. It has been fixed upstream in the same
// nodejs package Apollo is using. The workaround is to use the original package
// again and disable Apollo's version.
app.use('/graphql', graphqlUploadExpress({ maxFileSize: 524288000, maxFiles: 10 }))

// This needs to come after the passport middleware
apolloServer.applyMiddleware({ app })

app.post('/login',
  passport.authenticate('local'),
  async (req, res) => {
    // NOTE: This may be required again at some point, but now that the issue here:
    // https://github.com/apollographql/apollo-client/issues/4125
    // has been resolved, it looks like I can roll back some rollbacks.
    // const passbackUser = {}
    // Object.assign(passbackUser, req.user)
    // passbackUser.orgs = await req.user.orgs()
    // res.json({ user: passbackUser })
    res.json({ user: req.user })
  })

app.get('/logout', (req, res) => { req.logout(); res.send('Logged out') })

app.get('/whoami', (req, res) => {
  if (req.user) {
    res.send(req.user.username)
  } else {
    res.send('not logged in')
  }
})

app.get('/dataset/:id', async (req, res) => {
  const dataset = await Dataset.get(req.params.id)

  if (dataset && await dataset.canAccess(req.user)) {
    DefaultQueue.prepareDownload(dataset, () => {
      res.attachment(`${dataset.name}.csv`)
      dataset.readStream().pipe(res)
    })
  } else {
    res.status(404).send('Not found')
  }
})

const httpServer = http.createServer(app)
apolloServer.installSubscriptionHandlers(httpServer)
// run server on port 3000
const PORT = 3000
const server = httpServer.listen(PORT, (err) => {
  if (err) {
    logger.error(err)
  }
  logger.info(`Server ready at http://server:${PORT}${apolloServer.graphqlPath}`)
  logger.info(`Subscriptions ready at ws://server:${PORT}${apolloServer.subscriptionsPath}`)
})

DefaultQueue.start()

// Close all connections on shutdown
onExit(() => {
  logger.info('Shutting down...')
  server.close()
  DefaultQueue.close()
}, { alwaysLast: true })
