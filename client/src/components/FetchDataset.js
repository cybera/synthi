import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const FetchDataset = ({ children, datasetID }) => {
  const fetchDatasetQuery = gql`
    query FetchDataset($id: Int) {
      dataset(id:$id) { 
        id
        name 
        columns { 
          id 
          name 
          order 
        }
        rows
      } 
    }
  `

  return (
    <Query query={fetchDatasetQuery} variables={{ id: datasetID }}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
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
  datasetID: PropTypes.number
}

FetchDataset.defaultProps = {
  datasetID: null
}

export default FetchDataset
