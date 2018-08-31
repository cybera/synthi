# ADI 2.0

## Getting Started

### Technologies

- [React](https://reactjs.org) is used for the front end client.
- [GraphQL](https://graphql.org) is being used in lieu of REST to provide a rich API that the browser client and other potential 3rd party services can use to interact with ADI.
- [Apollo](https://www.apollographql.com) provides the actual implememtation of GraphQL on the client and server side.
- [Neo4J](https://neo4j.com) is used to store metadata about ADI datasets in a graph structure.
- [ExpressJS](https://expressjs.com) is the classic web server, often forwarding requests to the Apollo GraphQL API, but it can also handle typical web requests.
- [Material UI](https://material-ui.com) is a UI framework of ready made React components for common UI elements.
- [Webpack](https://webpack.js.org) and [Babel](https://babeljs.io) are used mainly behind the scenes to compile and bundle client side code in a way that is compatible with most modern browsers.

### Running a Development Environment

You'll need 3 things to get going on development: Neo4J running (API on port 7687, front end on port 7878), the ExpressJS server running (accessible on port 3000), and a development server serving up the client code (accessible on port 8080).

```bash
bin/neo4j start
bin/server
bin/dev-client
```
