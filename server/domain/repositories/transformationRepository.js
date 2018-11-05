import { safeQuery } from '../../neo4j/connection'
import { sendToWorkerQueue } from '../../lib/queue'
import Transformation from '../models/transformation'
import shortid from 'shortid'

export const inputTransformation = async (context, dataset) => {
  const query = [`
    MATCH (d:Dataset)
    WHERE ID(d) = toInteger($dataset.id)
    OPTIONAL MATCH (t:Transformation)-[:OUTPUT]->(d)
    RETURN t
  `, { dataset }]
  
  const results = await safeQuery(...query)

  if (results[0] && results[0]['t']) {
    return new Transformation(results[0]['t'], context)
  } else {
    return null
  }
}

export const saveInputTransformation = async (context, dataset, code) => {
  const query = [`
    MATCH (d:Dataset)
    WHERE ID(d) = toInteger($dataset.id)
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
      WHERE ID(t) = toInteger($transformation.id)
      SET t.script = $transformation.script
    `, { transformation }]

    await safeQuery(...saveQuery)

    if (!dataset.path) {
      dataset.path = `${shortid.generate()}-${dataset.name}.csv`.replace(/ /g, '_')
      const setDefaultPathQuery = [`
        MATCH (d:Dataset)
        WHERE ID(d) = toInteger($dataset.id)
        SET d.path = $dataset.path
      `, { dataset }]
      await safeQuery(...setDefaultPathQuery)
    }

    sendToWorkerQueue({
      task: 'register_transformation',
      id: transformation.id
    })

    return transformation
  } else {
    console.log("Couldn't save transformation")
    return null
  }
}