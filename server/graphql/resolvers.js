import { merge } from 'lodash'

import datasetResolvers from './resolvers/dataset'
import plotsResolvers from './resolvers/plots'
import transformationsResolvers from './resolvers/transformations'
import datasetMetadataResolvers from './resolvers/datasetMetadata'
import columnResolvers from './resolvers/column'
import generalResolvers from './resolvers/general'
import userResolvers from './resolvers/user'

export default merge(
  userResolvers,
  generalResolvers,
  datasetResolvers,
  columnResolvers,
  datasetMetadataResolvers,
  plotsResolvers,
  transformationsResolvers
)
