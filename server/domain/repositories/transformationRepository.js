import { safeQuery } from '../../neo4j/connection'
import Transformation from '../models/transformation'

export const inputTransformation = async (dataset) => {
  const query = [`
    MATCH (d:Dataset)
    WHERE ID(d) = $dataset.id
    OPTIONAL MATCH (t:Transformation)-[:OUTPUT]->(d)
    RETURN t
  `, { dataset }]
  
  const results = await safeQuery(...query)

  if (results[0] && results[0]['t']) {
    return new Transformation(results[0]['t'])
  } else {
    return null
  }
}

export const saveInputTransformation = async (dataset, code) => {
  const query = [`
    MATCH (d:Dataset)
    WHERE ID(d) = $dataset.id
    MERGE (t:Transformation)-[:OUTPUT]->(d)
    ON CREATE SET
      t.name = $dataset.name,
      t.inputs = [],
      t.outputs = []
    RETURN t
  `, { dataset }]
  const results = await safeQuery(...query)

  if (results[0] && results[0]['t']) {
    let transformation = new Transformation(results[0]['t'])
    console.log("transformation:")
    console.log(transformation)
    transformation.storeCode(code)

    const saveQuery = [`
      MATCH (t:Transformation)
      WHERE ID(t) = $transformation.id
      SET t.script = $transformation.script
    `, { transformation }]

    await safeQuery(...saveQuery)

    return transformation
  } else {
    console.log("Couldn't save transformation")
    return null
  }
}