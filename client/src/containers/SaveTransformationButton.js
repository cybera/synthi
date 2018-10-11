import React from 'react'

import { withStyles } from 'material-ui/styles'

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
      refetchQueries={[{ query: datasetViewQuery }]}>
      { saveMutation => (
        <ADIButton 
          onClick={
            (event) => saveMutation({ 
              variables: { 
                id: dataset.id,
                code: currentCode() 
              }
            })
          } 
        >Save</ADIButton>
      )}
    </Mutation>
  )
}

export default SaveTransformationButton

