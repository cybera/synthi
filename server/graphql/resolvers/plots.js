import { filterPlots, createPlot } from '../../domain/contexts/plot'

export default {
  Query: {
    plots: (_, { uuid }) => filterPlots({ uuid })
  },
  Mutation: {
    createPlot: (_, { jsondef }) => createPlot(jsondef)
  }
}
