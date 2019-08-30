import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import ADIButton from '../components/ADIButton'
import { datasetViewQuery } from '../queries'

const saveInputTransformationGQL = gql`
  mutation SaveInputTransformation($uuid: String!, $code: String) {
    saveInputTransformation(uuid: $uuid, code: $code) {
      id
      uuid
    }
  }
`

const SaveTransformationButton = (props) => {
  const { dataset, currentCode } = props
  return (
    <Mutation
      mutation={saveInputTransformationGQL}
      refetchQueries={[{ query: datasetViewQuery, variables: { uuid: dataset.uuid } }]}
    >
      { saveMutation => (
        <ADIButton
          onClick={
            () => saveMutation({
              variables: {
                uuid: dataset.uuid,
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
