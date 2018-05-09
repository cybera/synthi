import { makeExecutableSchema } from 'graphql-tools'
import resolvers from './resolvers'
import typeDefs from './typedefs'

export default makeExecutableSchema({ typeDefs, resolvers })
