import { applyMiddleware } from 'graphql-middleware'

import { makeExecutableSchema } from 'graphql-tools'

import { resolvers, permissions } from './resolvers'

import typeDefs from './typedefs'

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default applyMiddleware(schema, permissions)
