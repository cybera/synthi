import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { datasetViewQuery } from '../queries'

const generateDatasetGQL = gql`
  mutation Generate($id:Int!) {
    generateDataset(id:$id) {
      name
    }
  }
`

const DatasetGenerator = ({ children }) => {
  const simpleGenerator = (mutation) => {
    const generateDataset = id => mutation({
      variables: { id },
      refetchQueries: [
        { query: datasetViewQuery, variables: { id } }
      ]
    })

    return generateDataset
  }

  return (
    <Mutation mutation={generateDatasetGQL}>
      {
        generateDatasetMutation => children({
          generateDataset: simpleGenerator(generateDatasetMutation)
        })
      }
    </Mutation>
  )
}

DatasetGenerator.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func
  ]).isRequired
}

export default DatasetGenerator
