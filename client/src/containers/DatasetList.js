import React from 'react'

import { Query } from 'react-apollo'

import { datasetListQuery } from '../queries'

const withDatasets = Component => (props) => {
  let { searchString } = props

  if (!searchString) {
    searchString = undefined
  }

  return (
  <Query
    query={datasetListQuery}
      variables={{ searchString }}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error!</p>;

      return <Component {...props} datasets={data.dataset} />
    }}
  </Query>
)
}

export { withDatasets } // eslint-disable-line import/prefer-default-export
