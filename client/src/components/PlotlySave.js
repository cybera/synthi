import React from 'react'
import PropTypes from 'prop-types'

import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { plotsRetrieveQuery } from '../queries'

const createPlotGQL = gql`
  mutation CreatePlot($jsondef:String!) {
    createPlot(jsondef: $jsondef) {
      id
    }
  }
`

const PlotlySave = ({ children }) => {
  const withSerialization = (mutation) => {
    const savePlot = ({
      config,
      data,
      frames,
      layout
    }) => {
      const serializedJSON = JSON.stringify({
        config,
        data,
        frames,
        layout
      })
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
      { createPlotMutation => children({ savePlot: withSerialization(createPlotMutation) }) }
    </Mutation>
  )
}

PlotlySave.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func
  ]).isRequired
}

export default PlotlySave
