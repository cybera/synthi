import {
  dataset,
  plot,
  transformation,
  datasetMetadata,
  column,
  general,
  user,
  organization,
  task,
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
  task.typeDefs,
]

export default typeDefs
