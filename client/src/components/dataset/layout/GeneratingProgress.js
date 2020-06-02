import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'

import { SynthiButton } from '../../layout/buttons'
import { ToggleVisibility } from '../../layout'
import { datasetViewQuery } from '../../../queries'

const resetGeneratingMutation = gql`
mutation ResetGeneratingMutation($uuid: String!) {
  updateDataset(uuid: $uuid, generating: false) {
    uuid
  }
}
`

const styles = theme => ({
  buttonContainer: {
    marginTop: theme.spacing(2)
  }
})

const GeneratingProgress = (props) => {
  const { dataset, classes } = props
  const { uuid } = dataset
  return (
    <ToggleVisibility visible={dataset.generating}>
      <LinearProgress />
      <div className={classes.buttonContainer}>
        <Mutation
          mutation={resetGeneratingMutation}
          variables={{ uuid }}
          refetchQueries={[
            { query: datasetViewQuery, variables: { uuid } }
          ]}
        >
            { mutation => <SynthiButton onClick={mutation}>Reset Generating Flag</SynthiButton>}
        </Mutation>
      </div>
    </ToggleVisibility>
  )
}

export default withStyles(styles)(GeneratingProgress)
