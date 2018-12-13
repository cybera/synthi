import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'

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

const styles = theme => ({
  buttonContainer: {
    marginTop: theme.spacing.unit * 2
  }
})

const GeneratingProgress = (props) => {
  const { dataset, classes } = props
  const { id } = dataset
  return (
    <ToggleVisibility visible={dataset.generating}>
      <LinearProgress />
      <div className={classes.buttonContainer}>
        <Mutation
          mutation={resetGeneratingMutation}
          variables={{ id }}
          refetchQueries={[
            { query: datasetViewQuery, variables: { id } }
          ]}
        >
            { mutation => <ADIButton onClick={mutation}>Reset Generating Flag</ADIButton>}
        </Mutation>
      </div>
    </ToggleVisibility>
  )
}

export default withStyles(styles)(GeneratingProgress)
