import React from 'react'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'

import { ADIButton } from '../../layout/buttons'
import { ToggleVisibility } from '../../common'
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
    marginTop: theme.spacing.unit * 2
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
            { mutation => <ADIButton onClick={mutation}>Reset Generating Flag</ADIButton>}
        </Mutation>
      </div>
    </ToggleVisibility>
  )
}

export default withStyles(styles)(GeneratingProgress)
