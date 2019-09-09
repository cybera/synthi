import React from 'react'

import Button from '@material-ui/core/Button'
import CodeIcon from '@material-ui/icons/Code'
import { withStyles } from '@material-ui/core/styles'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetViewQuery } from '../../../../queries'

const styles = theme => ({
  button: {
    marginLeft: theme.spacing.unit
  },
  icon: {
    marginRight: theme.spacing.unit
  }
})

function ComputeButton(props) {
  const { classes, handleMode } = props

  return (
    <span className={classes.button}>
      <Button variant="contained" component="span" color="secondary" onClick={handleMode}>
        <CodeIcon className={classes.icon} />
        Compute
      </Button>
    </span>
  )
}

const StyledComputeButton = withStyles(styles)(ComputeButton)

const updateDatasetGQL = gql`
  mutation UpdateDataset($uuid: String!, $computed: Boolean) {
    updateDataset(uuid: $uuid, computed: $computed) {
      uuid
      name
    }
  }
`

class MutatingComputeButton extends React.Component {
  render() {
    const { uuid } = this.props

    return(
      <Mutation
        mutation={updateDatasetGQL}
        refetchQueries={[{ query: datasetViewQuery, variables: { uuid: uuid } }]}
      >
        { updateMutation => (
          <StyledComputeButton
            handleMode={
              (_event) => updateMutation({
                variables: {
                  uuid: uuid,
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
