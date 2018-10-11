import React from 'react'

import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import { withStyles } from 'material-ui/styles'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetViewQuery } from '../queries'

const styles = theme => ({
  root: {
    float: 'right'
  }
})

const DatasetModeToggle = (props) => {
  const { modes, selected_mode, handleMode, classes } = props

  return (
    <ToggleButtonGroup 
      value={selected_mode} 
      exclusive 
      onChange={handleMode}
      className={classes.root}>
      {modes.map(mode => (
        <ToggleButton value={mode} key={mode}>
          {mode}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

const StyledDatasetModeToggle = withStyles(styles)(DatasetModeToggle)

const updateDatasetGQL = gql`
  mutation UpdateDataset($id: Int!, $computed: Boolean) {
    updateDataset(id: $id, computed: $computed) {
      id
      name
    }
  }
`

const MutatingModeToggle = (props) => {
  const { dataset } = props
  return (
    <Mutation 
      mutation={updateDatasetGQL}
      refetchQueries={[{ query: datasetViewQuery }]}>
      { updateMutation => (
        <StyledDatasetModeToggle 
          handleMode={
            (event, mode) => updateMutation({ 
              variables: { 
                id: dataset.id,
                computed: mode == 'Computed' 
              }
            })
          } 
          modes={['Raw', 'Computed']}
          selected_mode={dataset.computed ? 'Computed' : 'Raw'}
        />
      )}
    </Mutation>
  )
}

export default MutatingModeToggle