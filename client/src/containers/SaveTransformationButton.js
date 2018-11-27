import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import ADIButton from '../components/ADIButton'
import { datasetViewQuery } from '../queries'

const saveInputTransformationGQL = gql`
  mutation SaveInputTransformation($id: Int!, $code: String) {
    saveInputTransformation(id: $id, code: $code) {
      id
    }
  }
`

const SaveTransformationButton = (props) => {
  const { dataset, currentCode } = props
  return (
    <Mutation
      mutation={saveInputTransformationGQL}
      refetchQueries={[{ query: datasetViewQuery, variables: { id: dataset.id } }]}
    >
      { saveMutation => (
        <ADIButton
          onClick={
            () => saveMutation({
              variables: {
                id: dataset.id,
                code: currentCode()
              }
            })
          }
        >
          Save
        </ADIButton>
      )}
    </Mutation>
  )
}

export default SaveTransformationButton
