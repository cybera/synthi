import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import LinearProgress from '@material-ui/core/LinearProgress'

import ADIButton from './ADIButton'
import ToggleVisibility from './ToggleVisibility'

import { datasetViewQuery } from '../queries'

const resetGeneratingMutation = gql`
mutation ResetGeneratingMutation($id: Int!) {
  updateDataset(id: $id, generating: false) {
    id
    uuid
  }
}
`

const GeneratingProgress = (props) => {
  const { dataset } = props
  const { id } = dataset
  return (
    <ToggleVisibility visible={dataset.generating}>
      <LinearProgress />
      <Mutation
        mutation={resetGeneratingMutation}
        variables={{ id }}
        refetchQueries={[
          { query: datasetViewQuery, variables: { id } }
        ]}
      >
        { mutation => <ADIButton onClick={mutation}>Reset Generating Flag</ADIButton>}
      </Mutation>
    </ToggleVisibility>
  )
}

export default GeneratingProgress
