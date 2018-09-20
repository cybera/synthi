import React from 'react'

import Plot from './Plot'

import NavigationContext from '../context/NavigationContext'
import { plotsRetrieveQuery } from '../queries'
import { Query } from "react-apollo";

class Scenarios extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <Query query={plotsRetrieveQuery}>
        {({ loading, error, data: result }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <p>Error!</p>

          return(
            <div>
              {result.plots.map(({ id, jsondef }) => {
                const jsonobj = JSON.parse(jsondef)
                return <Plot {...jsonobj} key={id}/> 
              })}
            </div>
          )
        }}
        </Query>
      </div>
    );
  }
}

export default Scenarios