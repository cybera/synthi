import { merge } from 'lodash'

import datasetResolvers from './resolvers/dataset'
import plotsResolvers from './resolvers/plots'
import transformationsResolvers from './resolvers/transformations'
import datasetMetadataResolvers from './resolvers/datasetMetadata'
import columnResolvers from './resolvers/column'
import generalResolvers from './resolvers/general'
import User from '../domain/models/user'

const mainResolvers = {
  Query: {
    async currentUser(_, params, context) {
      const user = await User.get(context.user.id)
      return user
    }
  },
  Mutation: {
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
