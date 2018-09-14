import 'dotenv/config'

import { apolloUploadExpress } from 'apollo-upload-server'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'

import express from 'express'

import schema from './graphql/schema'
import cors from 'cors'

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import flash from 'connect-flash'
import session from 'express-session'

import morgan from 'morgan'

import { safeQuery } from './neo4j/connection'
import { ensureDatasetExists, waitForFile } from './lib/util'
import UserRepository from './model/userRepository'

const app = express()

app.use(cors())

app.get('/', (req, res) => res.send("Hello world !"))

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
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret-token-123456' }))
app.use(passport.initialize())
app.use(passport.session())

app.use(
  '/graphql',
  bodyParser.json(),
  apolloUploadExpress(),
  graphqlExpress(req => ({
    schema,
    context: {
      user: req.user
    }
  }))
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

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
