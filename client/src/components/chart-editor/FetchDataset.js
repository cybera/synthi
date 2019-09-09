import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

import PanelLoadingState from '../layout/PanelLoadingState'

const FetchDataset = ({ children, datasetUUID }) => {
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
    <Query query={fetchDatasetQuery} variables={{ uuid: datasetUUID }}>
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
  datasetUUID: PropTypes.string
}

FetchDataset.defaultProps = {
  datasetUUID: null
}

export default FetchDataset
