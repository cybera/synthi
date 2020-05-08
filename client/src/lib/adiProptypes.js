import {
  shape,
  number,
  bool,
  string,
  arrayOf,
  node,
  func,
  oneOfType,
  oneOf,
} from 'prop-types'

export const tagProptype = shape({
  name: string.isRequired
})

export const columnProptype = shape({
  name: string.isRequired,
  tags: arrayOf(tagProptype)
})

export const columnsProptype = arrayOf(columnProptype)

export const datasetMetadataProptype = shape({
  description: string,
  dateCreated: number,
  dateUpdated: number,
})

export const datasetProptype = shape({
  name: string,
  uuid: string,
  inputs: arrayOf(string),
  published: bool,
  ownerName: string,
  canPublish: bool,
  type: string,
  columns: columnsProptype,
  metadata: datasetMetadataProptype,
})

export const datasetsProptype = arrayOf(datasetProptype)

export const childrenProptype = oneOfType([
  arrayOf(node),
  node,
  func
])

export const transformationInputMappingProptype = shape({
  alias: string,
  dataset: shape({ name: string, uuid: string }),
})

export const transformationProptype = shape({
  name: string,
  inputs: arrayOf(string),
})

export const taskProptype = shape({
  uuid: string,
  state: oneOf(['done', 'initialized', 'error', 'registering']),
  message: string,
  type: oneOf(['import_csv', 'import_document', 'register', 'transform']),
})
