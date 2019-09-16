import React from 'react'
import { Query } from 'react-apollo'

import { datasetListQuery } from '../../../queries'
import { SearchLoadingState, SearchEmptyState } from './search'

const withDatasets = Component => (props) => {
  let { searchString } = props
  const { organization } = props

  if (!searchString) {
    searchString = undefined
  }

  return (
    <Query
      query={datasetListQuery}
      pollInterval={5000}
      variables={{ searchString, org: organization }}
    >
      {({ loading, error, data }) => {
        if (loading && searchString) return <SearchLoadingState content="Searching datasets..." />
        if (loading) return <SearchLoadingState content="Loading your datasets..." />
        if (error) return <p>Error!</p>

        const availableDatasets = data.dataset
        const available = availableDatasets.length > 0

        if (available) {
          return <Component {...props} datasets={availableDatasets} searchString={searchString} />
        }
        if (searchString) return <SearchEmptyState text="Your search did not return any results." />

        return <SearchEmptyState text="You haven't added any datasets yet." />
      }}
    </Query>
  )
}

export default withDatasets
