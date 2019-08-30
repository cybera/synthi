import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { datasetViewQuery } from '../queries'

const generateDatasetGQL = gql`
  mutation Generate($uuid:String!) {
    generateDataset(uuid:$uuid) {
      name
    }
  }
`

const DatasetGenerator = ({ children }) => {
  const simpleGenerator = (mutation) => {
    const generateDataset = uuid => mutation({
      variables: { uuid },
      refetchQueries: [
        { query: datasetViewQuery, variables: { uuid } }
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
