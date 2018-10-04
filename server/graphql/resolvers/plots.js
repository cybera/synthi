import { safeQuery } from '../../neo4j/connection'

export default {
  Query: {
    plots(_, { id }) {
      let query = ['MATCH (p:Plot) RETURN p.jsondef AS jsondef, ID(p) as id']
      if (id != null) {
        query = [`MATCH (p:Plot) 
                  WHERE ID(p) = $id 
                  RETURN 
                    p.jsondef AS jsondef, 
                    ID(p) AS id`, { id }]
      }
      return safeQuery(...query)
    }
  },
  Mutation: {
    createPlot(_, { jsondef }) {
      return safeQuery(`
        CREATE (p:Plot { jsondef: $jsondef }) 
        RETURN ID(p) AS id, p.jsondef AS jsondef
      `,
      { jsondef }).then(results => results[0])
    }
  }
}
