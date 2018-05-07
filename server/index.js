const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./graphql/schema/Schema')

const app = express()

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

app.get('/', (req, res) => res.send("Hello world !"))
// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))