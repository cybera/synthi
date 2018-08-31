import { Mutation } from 'react-apollo'
import React from 'react'
import { plotsRetrieveQuery } from '../queries'
import gql from "graphql-tag";

const createPlotGQL = gql`
  mutation CreatePlot($jsondef:String!) {
    createPlot(jsondef: $jsondef) {
      id
    }
  }
`

const PlotlySave = ({children}) => {
  const withSerialization = (mutation) => {
    const savePlot = ({config,data,frames,layout}) => {
      const serializedJSON = JSON.stringify({config,data,frames,layout})
      return mutation({ 
        variables: { jsondef: serializedJSON },
        refetchQueries: [
          { query: plotsRetrieveQuery }
        ]
      })
    }
    return savePlot
  }

  return (
    <Mutation mutation={createPlotGQL}>
      { createPlotMutation => children({savePlot:withSerialization(createPlotMutation)}) }      
    </Mutation>
  )
}

export default PlotlySave