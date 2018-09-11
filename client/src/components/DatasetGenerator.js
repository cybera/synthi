import { Mutation } from 'react-apollo'
import React from 'react'

import gql from "graphql-tag";

const generateDatasetGQL = gql`
  mutation Generate($id:Int!) {
    generateDataset(id:$id) {
      name
    }
  }
`

const DatasetGenerator = ({children}) => {
  const simpleGenerator = (mutation) => {
    const generateDataset = (id) => {
      return mutation({ 
        variables: { id: id },
        // refetchQueries: [
        //   { query: plotsRetrieveQuery }
        // ]
      })
    }
    return generateDataset
  }

  return (
    <Mutation mutation={generateDatasetGQL}>
      { generateDatasetMutation => children({generateDataset:simpleGenerator(generateDatasetMutation)}) }      
    </Mutation>
  )
}

export default DatasetGenerator