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
import cookieParser from 'cookie-parser'

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

// Authentication w/ passportjs
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(`here: ${username}/${password}`)
    if(username == "test" && password == "password") {
      console.log("verified")
      done(null, username);
    }
  }
));

passport.serializeUser(function(user, cb) {
  console.log("serializeUser: " + user)
//  cb(null, user.id);
  cb(null, user)
});

passport.deserializeUser(function(id, cb) {
  console.log("deserializeUser: " + id)
  // db.users.findById(id, function (err, user) {
  //   if (err) { return cb(err); }
  //   cb(null, user);
  // });
  cb(null, id)
})

app.use(morgan('combined'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret-token-123456',
                  resave: false, 
                  saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.post('/login',
  passport.authenticate('local'),
  (req, res) => res.send(JSON.stringify({ user: req.user }))
);

app.get('/testing', (req, res) => { 
  res.send(`hello: ${req.user}`)
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