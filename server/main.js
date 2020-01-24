import http from 'http'

import bodyParser from 'body-parser'

import express from 'express'

import { ApolloServer, ForbiddenError } from 'apollo-server-express'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import cors from 'cors'

import config from 'config'

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

import session from 'express-session'

import morgan from 'morgan'

import onExit from 'signal-exit'

import { execute, subscribe } from 'graphql'
import { graphqlUploadExpress } from 'graphql-upload'

import schema from './graphql/schema'

import logger from './config/winston'
// Even if the direct need for ModelFactory is removed from the startup, it's important
// that this import runs as early as possible, as it makes sure that all models are
// registered without having to directly import them in places where that could cause
// dependency cycles.
import { ModelFactory } from './domain/models'
import DefaultQueue from './lib/queue'
import { NonAsyncRedisClient } from './lib/redisClient'
import User from './domain/models/user'
import { checkConfig } from './lib/startup-checks'
import { updateTask } from './domain/contexts/task'


const main = async () => {
  const passed = await checkConfig()
  if (!passed) {
    process.exit(1)
  }

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
    logger.debug(`serializeUser: ${user.uuid}`)
    done(null, user.uuid)
  });

  passport.deserializeUser(async (uuid, done) => {
    logger.debug(`deserializeUser: ${uuid}`)
    let user
    try {
      user = await User.getByUuid(uuid)
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
  app.use(express.json())

  const RedisStore = require('connect-redis')(session)
  const sessionMiddleware = session({
    store: new RedisStore({ client: NonAsyncRedisClient }),
    secret: config.get('server').secret,
    resave: false
  })
  app.use(sessionMiddleware)

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
    schema,
    context: ({ req }) => {
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

  app.get('/dataset/:uuid', async (req, res) => {
    const dataset = await ModelFactory.getByUuid(req.params.uuid)
    const type = req.query.type || 'imported'

    if (dataset) {
      await dataset.download(req, res, type)
    } else {
      res.status(404).send('Not found')
    }
  })

  app.post('/updateTask', async (req, res) => {
    console.log(req.body)
    updateTask(req.body)
    res.send('')
  })

  const httpServer = http.createServer(app)

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      /*
       * Use the session middleware to check that any operation coming over
       * websocket is part of a valid session. The request headers, which
       * include the session cookie, are part of the upgradeReq object which we
       * pass to the middleware. The middleware will retrieve the session from
       * the session store if it exists which we then use to retrieve the user
       * and add it to the graphql context. This is poorly documented behaviour
       * that's been pieced together from multiple sources and there may be
       * more correct ways to do this.
      */
      onOperation: async (message, params, webSocket) => {
        const wsSession = await new Promise((resolve) => {
          sessionMiddleware(webSocket.upgradeReq, {}, () => {
            if (webSocket.upgradeReq.session) {
              resolve(webSocket.upgradeReq.session)
            }
            return false
          })
        })

        if (wsSession.passport && wsSession.passport.user) {
          const user = await User.getByUuid(wsSession.passport.user)

          if (!user) {
            throw new ForbiddenError('Not logged in')
          }

          return {
            ...params,
            context: {
              user,
              ...params.context,
            },
          }
        }

        throw new ForbiddenError('Not logged in')
      },
    },
    {
      server: httpServer,
      path: '/graphql'
    }
  )

  // apolloServer.installSubscriptionHandlers(httpServer)
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

  // TODO: Somehow SIGTERM is being ignored, this is a hack to make it
  // trigger onExit()
  process.on('SIGTERM', () => {
    process.exit()
  })


  // Close all connections on shutdown
  onExit(() => {
    logger.info('Shutting down...')
    server.close()
    DefaultQueue.close()
  }, { alwaysLast: true })
}

main()
