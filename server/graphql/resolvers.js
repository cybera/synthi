import { merge } from 'lodash'

import datasetResolvers from './resolvers/dataset'
import plotsResolvers from './resolvers/plots'
import transformationsResolvers from './resolvers/transformations'
import datasetMetadataResolvers from './resolvers/datasetMetadata'
import columnResolvers from './resolvers/column'
import generalResolvers from './resolvers/general'
import User from '../domain/models/user'

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
  Query: {
    async currentUser(_, params, context) {
      console.log(context)
      return User.get(context.user.id)
    }
  },
  Mutation: {
    uploadFile: (_, { file }) => processUpload(file),
    regenerateAPIKey: async (_, params, context) => {
      const user = await User.get(context.user.id)
      user.regenerateAPIKey()
      return user
    }
  },
  User: {
    organizations: user => user.orgs()
  }
}

export default merge(
  mainResolvers,
  generalResolvers,
  datasetResolvers,
  columnResolvers,
  datasetMetadataResolvers,
  plotsResolvers,
  transformationsResolvers
)
