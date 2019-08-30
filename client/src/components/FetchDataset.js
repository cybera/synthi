import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

import PanelLoadingState from './PanelLoadingState'

const FetchDataset = ({ children, datasetID }) => {
  const fetchDatasetQuery = gql`
    query FetchDataset($uuid: String) {
      dataset(uuid: $uuid) { 
        uuid
        name 
        columns { 
          uuid 
          name 
          order 
        }
        rows
      } 
    }
  `

  return (
    <Query query={fetchDatasetQuery} variables={{ uuid: datasetID }}>
      {({ loading, error, data }) => {
        if (loading) return <PanelLoadingState />
        if (error) return <p>Error!</p>;

        const dataset = data.dataset[0]

        return children({ dataset })
      }}
    </Query>
  )
}

FetchDataset.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func
  ]).isRequired,
  datasetID: PropTypes.string
}

FetchDataset.defaultProps = {
  datasetID: null
}

export default FetchDataset
