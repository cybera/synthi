import React from 'react'
import { Query } from "react-apollo"
import { datasetListQuery } from '../queries'

function withDatasets(Component) {
  return function WithDatasetsComponent(props) {
    return (
      <Query 
        query={datasetListQuery}
        pollInterval={20000}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error!</p>;

          return <Component {...props} datasets={data.dataset} />
        }}
      </Query>
    )
  }
}

export { withDatasets }
