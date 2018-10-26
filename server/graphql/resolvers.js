import { merge } from 'lodash'

import datasetResolvers from './resolvers/dataset'
import plotsResolvers from './resolvers/plots'
import transformationsResolvers from './resolvers/transformations'
import datasetMetadataResolvers from './resolvers/datasetMetadata'
import generalResolvers from './resolvers/general'

import { storeFS } from '../lib/util'

const processUpload = async (upload) => {
  const {
    stream,
    filename,
    mimetype,
    encoding
  } = await upload

  const { id, path } = await storeFS({ stream, filename })

  // return storeDB({ id, filename, mimetype, encoding, path })
  return {
    id,
    filename,
    mimetype,
    encoding,
    path
  }
}

const mainResolvers = {
  Mutation: {
    uploadFile: (_, { file }) => processUpload(file)
  }
}

export default merge(
  mainResolvers,
  generalResolvers,
  datasetResolvers,
  datasetMetadataResolvers,
  plotsResolvers,
  transformationsResolvers
)
