import {
  dataset,
  plot,
  transformation,
  datasetMetadata,
  column,
  general,
  user,
  organization
} from './modules'


const typeDefs = [
  general.typeDefs,
  plot.typeDefs,
  dataset.typeDefs,
  column.typeDefs,
  datasetMetadata.typeDefs,
  organization.typeDefs,
  user.typeDefs,
  transformation.typeDefs,
]

export default typeDefs
