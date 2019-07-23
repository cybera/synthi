import { safeQuery } from '../../neo4j/connection'
import Transformation from '../models/transformation'

/* eslint-disable import/prefer-default-export */
export const inputTransformation = async (context, dataset) => {
  const query = [`
    MATCH (d:Dataset)
    WHERE ID(d) = toInteger($dataset.id)
    OPTIONAL MATCH (t:Transformation)-[:OUTPUT]->(d)
    RETURN t
  `, { dataset }]

  const results = await safeQuery(...query)

  if (results[0] && results[0].t) {
    return new Transformation(results[0].t, context)
  }

  return null
}

/* eslint-enable import/prefer-default-export */
