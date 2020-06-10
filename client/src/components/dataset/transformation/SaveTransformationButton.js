import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { SynthiButton } from '../../layout/buttons'
import { datasetViewQuery } from '../../../queries'

const saveInputTransformationGQL = gql`
  mutation SaveInputTransformation($uuid: String!, $code: String) {
    saveInputTransformation(uuid: $uuid, code: $code) {
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
        <SynthiButton
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
        </SynthiButton>
      )}
    </Mutation>
  )
}

export default SaveTransformationButton
