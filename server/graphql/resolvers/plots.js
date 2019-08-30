import { safeQuery } from '../../neo4j/connection'

export default {
  Query: {
    plots(_, { uuid }) {
      let query = ['MATCH (p:Plot) RETURN p.jsondef AS jsondef, p.uuid as uuid, ID(p) as id']
      if (uuid != null) {
        query = [`MATCH (p:Plot { uuid: $uuid })
                  RETURN 
                    p.jsondef AS jsondef,
                    p.uuid AS uuid, 
                    ID(p) AS id`, { uuid }]
      }
      return safeQuery(...query)
    }
  },
  Mutation: {
    createPlot(_, { jsondef }) {
      return safeQuery(`
        CREATE (p:Plot { jsondef: $jsondef, uuid: randomUUID() }) 
        RETURN ID(p) AS id, p.uuid AS uuid, p.jsondef AS jsondef
      `,
      { jsondef }).then(results => results[0])
    }
  }
}
