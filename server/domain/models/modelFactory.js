import { containsProperties } from '../../lib/util'
import { safeQuery } from '../../neo4j/connection'

const classRegistry = {}
const labelRegistry = {}

export function register(modelClass, neo4JLabel = modelClass.name, properties = {}) {
  classRegistry[modelClass.name] = modelClass
  if (!(neo4JLabel in labelRegistry)) {
    labelRegistry[neo4JLabel] = []
  }
  labelRegistry[neo4JLabel].push({
    modelClassname: modelClass.name,
    properties
  })
  // Every time an entry is added, which is going to be much less frequent than
  // when they are accessed, sort the list from the most specific set of properties
  // to the least specific.
  labelRegistry[neo4JLabel].sort(({ properties: a }, { properties: b }) => (
    Object.keys(b).length - Object.keys(a).length
  ))
}

export function deriveClass(label, properties) {
  const possibleClasses = labelRegistry[label]
  let foundClassname = null
  possibleClasses.forEach((modelClass) => {
    if (!foundClassname && containsProperties(properties, modelClass.properties)) {
      foundClassname = modelClass.modelClassname
    }
  })

  if (foundClassname) {
    return classRegistry[foundClassname]
  }

  throw Error(`Can't derive class for node with label: ${label}`)
}

export function derive(neo4JNode) {
  const label = neo4JNode.labels[0]
  const { properties } = neo4JNode

  const ModelClass = deriveClass(label, properties)

  return new ModelClass(neo4JNode)
}

export function getClass(datasetClassname) {
  return classRegistry[datasetClassname]
}

export async function getByUniqueMatch(matchQuery, params) {
  const results = await safeQuery(matchQuery, params)
  if (!results[0]) {
    return null
  }
  const result = results[0]
  const resultKeys = Object.keys(result)
  if (resultKeys.length !== 1) {
    throw Error('matchQuery for getByUniqueMatch should only have one return node')
  }

  return derive(result[resultKeys[0]])
}

export async function get(id) {
  const safeId = parseInt(id, 10)
  const query = `
    MATCH (node)
    WHERE ID(node) = toInteger($id)
    RETURN node
  `
  return this.getByUniqueMatch(query, { id: safeId })
}

export async function getByUuid(uuid) {
  const query = `
    MATCH (node { uuid: $uuid })
    RETURN node
  `
  return this.getByUniqueMatch(query, { uuid })
}

export async function getByName(name, label, ownerUUID) {
  // TODO: Throw error if the label provided is not one where we guarantee unique names per org
  const query = `
    MATCH (node:${label} { name: $name })<-[:OWNER]-(:Organization { uuid: $ownerUUID })
    RETURN node
  `
  return this.getByUniqueMatch(query, { name, ownerUUID })
}
