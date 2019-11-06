import {
  shape,
  number,
  bool,
  string,
  arrayOf,
  node,
  func,
  oneOfType,
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
