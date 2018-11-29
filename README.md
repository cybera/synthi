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

### Prerequisites

* Docker and Docker Compose
* OpenStack credentials for object storage
* Node.js for your local development environment

### Setup

To create the initial configuration, copy the example config:

```bash
cp config/development.toml.example config/development.toml
```

Use your OpenStack credentials to populate the values in `[storage.object.creds]`.

Now source your OpenStack credentials and create the Swift containers:

```bash
swift post adi_datasets
swift post adi_scripts
```

Now build the Docker images and launch the application:

```bash
docker-compose build
docker-compose up -d
```

After that's done, run the database migrations:

```bash
bin/migrate
```

Finally, create the first user:

```bash
bin/create-user <user>
```

Now you should be able to login and start using the application from http://localhost:8080.

### Development

Node.js dependencies need to be installed locally for autocompletion and linting:

```bash
cd server && npm install
cd client && npm install
```

All source code is bind mounted into its respective container so any local changes will automatically be reflected in the running application without the need to restart containers or rebuild images. However, this does *not* include the `node_modules` directories because some modules have compiled components that need to be built for the correct architecture. Unfortunately that means `npm install` needs to be run locally *and* in the client and/or server containers when dependencies change.

### Scripts

There are a number of useful helper scripts in the `bin` directory:

* `add-user-to-org <user> <org>` - Adds an existing user to an existing organization
* `create-org <org>` - Creates an organization
* `create-user <user>` - Creates a user
* `migrate` - Run the database migrations
* `shell <service>` - Drops you to a bash shell in the specified service container
* `update-deps [client|server]` - Runs `npm install` on the client, server or both

### Endpoints

* http://localhost:8080 - Client
* http://localhost:3000 - Server
* http://localhost:8080/graphql - GraphQL playground
* http://localhost:7474 - Neo4j Browser

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

### Migrations

Some changes will require data updates. There is a simple migration system in place. You can add a new migration (in python) by placing a file in services/migrations. You can run migrations via `bin/migrate`.

Migrations will be run in the order the names would be sorted, so you know for sure a migration shouldn't be run until another one has been run, you can affect the order by appropriate naming. The current convention is to prefix the migration name with a double digit integer to indicate order (`00_`, `01_`, etc).

One important assumption you should consider when making migrations is that all migrations are idempotent. That is, if they will do their own checking to see whether they need to change anything, based on the current state, and if there's nothing to change, they'll have no effect. Your migration script should be able to be run any number of times and only change data when it's not in the state it should be. This means you can also add to existing migrations if it makes sense, but it also means that there isn't really a concept of rolling back.
