import 'dotenv/config'

import http from 'http'

import bodyParser from 'body-parser'

import express from 'express'

import { ApolloServer, gql } from 'apollo-server-express'

import resolvers from './graphql/resolvers'
import typeDefs from './graphql/typedefs'

import cors from 'cors'

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import flash from 'connect-flash'
import session from 'express-session'

import morgan from 'morgan'

import neo4j, { safeQuery } from './neo4j/connection'
import { ensureDatasetExists, waitForFile } from './lib/util'
import { startDatasetStatusConsumer } from './lib/queue'
import UserRepository from './model/userRepository'
import onExit from 'signal-exit'

const app = express()
const apolloServer = new ApolloServer({ typeDefs, resolvers })
apolloServer.applyMiddleware({ app })

app.use(cors())

// Authentication w/ passportjs
passport.use(new LocalStrategy(
  async (username, password, done) => {
    console.log(`here: ${username}/${password}`)
    let user;
    try {
      user = await UserRepository.getByUsername(username)
      if (!user) {
        return done(null, false)
      }
    } catch (err) {
      return done(err)
    }
    if (password !== 'password') {
      done(null, false);
    }
    console.log('verified')
    return done(null, user)
  }
));

passport.serializeUser((user, done) => {
  console.log(`serializeUser: ${user.id}`)
  // done(null, user.id);
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
app.use(session({ secret: 'secret-token-123456' }))
app.use(passport.initialize())
app.use(passport.session())

app.post('/login',
  passport.authenticate('local'),
  (req, res) => res.json({ user: req.user })
);

app.get('/testing', (req, res) => { 
  res.send(`hello: ${req.user}`)
})

app.get('/dataset/:id', async (req, res) => {
  let dataset = await safeQuery(`MATCH(d:Dataset)
                                 WHERE ID(d) = $id
                                 RETURN d.name AS name, 
                                        ID(d) AS id,
                                        d.computed AS computed,
                                        d.path AS path
                                `, { id: parseInt(req.params.id) })
                      .then(result => result[0])
                      
  ensureDatasetExists(dataset)
  
  await waitForFile(dataset.path).catch(err => console.log(err))

  res.download(dataset.path, `${dataset.name}.csv`, (err) => res.send(err))
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
  neo4j.close()
  server.close()
  queueConnection.close()
}, { alwaysLast: true })