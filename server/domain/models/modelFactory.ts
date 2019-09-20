import { containsProperties } from '../../lib/util'
import { safeQuery, Indexable } from '../../neo4j/connection'
import Base, { ModelPromise } from './base'

interface LabelRegistry {
  [key: string]: {
    modelClassname: string
    properties: Indexable
  }[]
}

interface Constructable<T extends typeof Base> {
  new(node: Indexable): InstanceType<T>
}

const classRegistry: Indexable = {}
const labelRegistry: LabelRegistry = {}

export function register<T extends typeof Base>(modelClass: Constructable<T>, neo4JLabel = modelClass.name, properties: Indexable = {}): void {
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

export function deriveClass<T extends typeof Base>(label: string, properties: Indexable): Constructable<T> {
  const possibleClasses = labelRegistry[label]
  let foundClassname: string|null = null
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

export function derive<T extends typeof Base>(neo4JNode: Indexable): InstanceType<T> {
  const label = neo4JNode.labels[0]
  const { properties } = neo4JNode

  const ModelClass = deriveClass(label, properties)

  return new ModelClass(neo4JNode) as InstanceType<T>
}

export function getClass<T extends typeof Base>(datasetClassname: string): Constructable<T> {
  return classRegistry[datasetClassname]
}

export async function getByUniqueMatch<T extends typeof Base>(matchQuery: string, params: Indexable): ModelPromise<T> {
  const results = await safeQuery(matchQuery, params)
  if (!results[0]) {
    return null
  }
  const result = results[0]
  const resultKeys = Object.keys(result)
  if (resultKeys.length !== 1) {
    throw Error('matchQuery for getByUniqueMatch should only have one return node')
  }

  return derive<T>(result[resultKeys[0]])
}

export async function get<T extends typeof Base>(id: string): ModelPromise<T> {
  const safeId = parseInt(id, 10)
  const query = `
    MATCH (node)
    WHERE ID(node) = toInteger($id)
    RETURN node
  `
  return getByUniqueMatch<T>(query, { id: safeId })
}

export async function getByUuid<T extends typeof Base>(uuid: string): ModelPromise<T> {
  const query = `
    MATCH (node { uuid: $uuid })
    RETURN node
  `
  return getByUniqueMatch<T>(query, { uuid })
}

export async function getByName<T extends typeof Base>(name: string, label: string, ownerUUID: string): ModelPromise<T> {
  // TODO: Throw error if the label provided is not one where we guarantee unique names per org
  const query = `
    MATCH (node:${label} { name: $name })<-[:OWNER]-(:Organization { uuid: $ownerUUID })
    RETURN node
  `
  return getByUniqueMatch<T>(query, { name, ownerUUID })
}
