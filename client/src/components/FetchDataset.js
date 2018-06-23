import gql from "graphql-tag"
import { Query } from "react-apollo"
import React from 'react'

const FetchDataset = ({children, datasetID}) => {
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
    <Query query={fetchDatasetQuery} variables={{id:datasetID}}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        const dataset = data.dataset[0]

        return children({dataset})
      }}
    </Query>
  )
}

export default FetchDataset