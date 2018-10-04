import mkdirp from 'mkdirp'
import pathlib from 'path'
import { merge } from 'lodash'

import datasetResolvers from './resolvers/dataset'
import plotsResolvers from './resolvers/plots'

import { storeFS } from '../lib/util'

const uploadDir = pathlib.resolve(process.env.UPLOADS_FOLDER)

// Ensure upload directory exists
mkdirp.sync(uploadDir)

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

export default merge(mainResolvers, datasetResolvers, plotsResolvers)
