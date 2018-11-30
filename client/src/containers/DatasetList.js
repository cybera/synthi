import React from 'react'

import { Query } from 'react-apollo'

import { datasetListQuery } from '../queries'

import SearchEmptyState from '../components/SearchEmptyState'
import SearchLoadingState from '../components/SearchLoadingState'

const withDatasets = Component => (props) => {
  let { searchString } = props

  if (!searchString) {
    searchString = undefined
  }

  return (
    <Query
      query={datasetListQuery}
      pollInterval={5000}
      variables={{ searchString }}
    >
      {({ loading, error, data }) => {
        if (loading && searchString) return <SearchLoadingState />
        if (loading) return <p>Loading...</p>
        if (error) return <p>Error!</p>

        const availableDatasets = data.dataset
        const available = availableDatasets.length > 0

        if (available) return <Component {...props} datasets={availableDatasets} searchString={searchString} />
        return(<SearchEmptyState />)
      }}
    </Query>
  )
}

export { withDatasets } // eslint-disable-line import/prefer-default-export
