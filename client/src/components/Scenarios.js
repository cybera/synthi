import React from 'react'

import { Query } from 'react-apollo'

import Plot from './Plot'
import PanelLoadingState from './PanelLoadingState'
import { plotsRetrieveQuery } from '../queries'

const Scenarios = () => (
  <div>
    <Query query={plotsRetrieveQuery}>
      {({ loading, error, data: result }) => {
        if (loading) return <PanelLoadingState />
        if (error) return <p>Error!</p>

        return (
          <div>
            {result.plots.map(({ id, jsondef }) => {
              const jsonobj = JSON.parse(jsondef)
              return <Plot {...jsonobj} key={id} />
            })}
          </div>
        )
      }}
    </Query>
  </div>
)

export default Scenarios
