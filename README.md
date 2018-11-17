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

For autocompletion and linting you'll need to install [NPM](https://www.npmjs.com/get-npm) and then run the following commands to install the dependencies:

```bash
cd server && npm install
cd client && npm install
```

```bash
docker-compose build
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

To update Node dependencies in the Docker container:

```bash
bin/update-deps [client/server]
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

### Debugging with VS Code

To debug the NodeJS server within VS Code, you need to first restart the server in debug mode:

```bash
bin/server debug
```

The server will not fully complete starting until you attach the debugger. You can do that by selecting the Debug panel in VS Code and then clicking the play button on the "Attach to Docker" configuration at the top.

![Attach in VSCode](docs/images/vscode-debug.png)

After a few seconds, the startup should complete, and you will now be able to set breakpoints on the server code.

You may need to manually restart the debug server at times. You can do that by running the above command again. To go back to a regular development setup that doesn't require VS Code's debugger to be running, you can use:

```bash
bin/server development
```
<<<<<<< HEAD

### Migrations

Some changes will require data updates. There is a simple migration system in place. You can add a new migration (in python) by placing a file in services/migrations. You can run migrations via `bin/migrate`.

Migrations will be run in the order the names would be sorted, so you know for sure a migration shouldn't be run until another one has been run, you can affect the order by appropriate naming. The current convention is to prefix the migration name with a double digit integer to indicate order (`00_`, `01_`, etc).

One important assumption you should consider when making migrations is that all migrations are idempotent. That is, if they will do their own checking to see whether they need to change anything, based on the current state, and if there's nothing to change, they'll have no effect. Your migration script should be able to be run any number of times and only change data when it's not in the state it should be. This means you can also add to existing migrations if it makes sense, but it also means that there isn't really a concept of rolling back.
=======
>>>>>>> Convert remaining uses of dotenv to config
