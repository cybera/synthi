import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

export default {
  // From: https://www.apollographql.com/docs/graphql-tools/scalars.html
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value) // value from the client
    },
    serialize(value) {
      // the neo4j client returns a DateTime structure that won't have getTime(),
      // but it can be passed into a Date to recreate it, and if a Date is passed
      // into a Date, we get the same value back. See documentation here on DateTime:
      // https://neo4j.com/docs/api/javascript-driver/current/class/src/v1/temporal-types.js~DateTime.html
      return (new Date(value)).getTime() // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null
    }
  })
}
