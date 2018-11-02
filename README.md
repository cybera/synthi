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

### Configuration

There are two configuration files you'll need to add some information to:

1. server/config/development.toml
2. services/python-worker/config/development.toml

Each of the containing directories already has a development.toml.example file that has placeholders for the necessary information. Unfortunately there's quite a bit of duplication at the moment.

For object storage, you'll need working Openstack credentials and two containers (one for scripts and one for datasets). These can be created via:

```bash
swift post your-scripts-container
swift post your-datasets-container
```

You should also set your neo4j username and password in the development.toml file.

### First time setup

You'll need to install [NPM](https://www.npmjs.com/get-npm) and then install necessary libraries in your local environment:

```bash
cd server && npm install && cp .env.example .env
cd client && npm install
```

```
docker-compose build
docker-compose run server bash
```

On the server:

```
npm uninstall bcrypt
npm install bcrypt
```

```
docker-compose stop
docker-compose up
docker-compose logs python-worker
```

#### Neo4J

Create the search index:

```cypher
CALL apoc.index.addAllNodes('DefaultDatasetSearchIndex', {
DatasetMetadata: ["title", "contributor", "contact", "description", "source", "identifier", "theme"],
Column: ["name"],
Dataset: ["name"]
}, { autoUpdate: true })
```

### Running a Development Environment

You'll need 3 things to get going on development: Neo4J running (API on port 7687, front end on port 7878), the ExpressJS server running (accessible on port 3000), and a development server serving up the client code (accessible on port 8080).

```bash
bin/neo4j start
bin/server
bin/dev-client
```

Or launch everything with docker:

```bash
docker-compose up -d
```

### Creating a User

```
bin/create-user USERNAME
```

### Neo4J plugins

ADI uses the following community libraries:

- [APOC](https://github.com/neo4j-contrib/neo4j-apoc-procedures): a bunch of useful procedures. We use the advanced search functionality APOC exposes.
- [GraphAware Framework](https://github.com/graphaware/neo4j-framework/): Framework required for GraphAware UUID
- [GraphAware Neo4J UUID](https://github.com/graphaware/neo4j-uuid): Automatically adds `uuid` properties to all nodes (see why we're using uuids and not the system ID value [here](https://neo4j.com/blog/dark-side-neo4j-worst-practices/)).

Current downloads for the GraphAware plugins can be found at: https://graphaware.com/products/

Current downloads for APOC can be found at: https://github.com/neo4j-contrib/neo4j-apoc-procedures#manual-installation-download-latest-release

The most current APOC download link is: https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/3.4.0.3

They may need to be upgraded at some point. There doesn't seem to be any sort of dependency/package manager for these and the files are relatively small, so the plugins are being checked into the repository (under neo4j/plugins).