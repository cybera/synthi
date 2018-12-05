import React from 'react'

import Button from '@material-ui/core/Button'
import CodeIcon from '@material-ui/icons/Code'
import { withStyles } from '@material-ui/core/styles'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetViewQuery } from '../queries'

const styles = theme => ({
  button: {
    marginLeft: theme.spacing.unit
  },
  icon: {
    marginRight: theme.spacing.unit
  }
})

class ComputeButton extends React.Component {
  render() {
    const { classes, handleMode } = this.props

    return(
      <span className={classes.button}>
        <Button variant="raised" component="span" color="secondary" onClick={handleMode}>
          <CodeIcon className={classes.icon} />
          Compute
        </Button>
      </span>
    )
  }
}

const StyledComputeButton = withStyles(styles)(ComputeButton)

const updateDatasetGQL = gql`
  mutation UpdateDataset($id: Int!, $computed: Boolean) {
    updateDataset(id: $id, computed: $computed) {
      id
      name
    }
  }
`

class MutatingComputeButton extends React.Component {
  render() {
    const { id } = this.props

    return(
      <Mutation
        mutation={updateDatasetGQL}
        refetchQueries={[{ query: datasetViewQuery, variables: { id: id } }]}
      >
        { updateMutation => (
          <StyledComputeButton
            handleMode={
              (_event) => updateMutation({
                variables: {
                  id: id,
                  computed: true
                }
              })
            }
          />
        )}
      </Mutation>
    )
  }
}

export default MutatingComputeButton