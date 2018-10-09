import React from 'react'
import DescriptionIcon from '@material-ui/icons/Description'
import { withStyles } from 'material-ui/styles'

import gql from "graphql-tag"
import { Mutation } from "react-apollo"
import { compose } from '../lib/common'

import { withNavigation } from '../context/NavigationContext'
import ADIButton from '../components/ADIButton'
import { datasetListQuery } from '../queries' 

const CREATE_DATASET = gql`
  mutation CreateDataset($name: String) {
    createDataset(name: $name) {
      id
      name
    }
  }
`

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: 10
  }
})

const NewDatasetButton = (props) => {
  const { classes } = props

  return (
    <Mutation 
      mutation={CREATE_DATASET}
      refetchQueries={[{ query: datasetListQuery }]}>
      {(mutate, { data }) => (
        <ADIButton onClick={mutate} className={classes.button}
                        variant="raised" color="primary" fullWidth={true}>
          New Dataset
          <DescriptionIcon className={classes.rightIcon}/>
        </ADIButton>
      )}
    </Mutation>
  )
}

export default compose(
  withNavigation,
  withStyles(styles)
)(NewDatasetButton)