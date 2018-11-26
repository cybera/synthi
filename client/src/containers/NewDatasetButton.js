import React from 'react'
import DescriptionIcon from '@material-ui/icons/Description'
import { withStyles } from '@material-ui/core/styles'

import gql from "graphql-tag"
import { Mutation } from "react-apollo"
import { compose } from '../lib/common'

import { withNavigation } from '../context/NavigationContext'
import ADIButton from '../components/ADIButton'
import { datasetListQuery } from '../queries'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'

const CREATE_DATASET = gql`
  mutation CreateDataset($name: String, $owner: Int) {
    createDataset(name: $name, owner: $owner) {
      id
      name
    }
  }
`

const styles = theme => ({
  button: {
    justifyContent: 'left',
    marginBottom: 5
  }
})
 
class NewDatasetButton extends React.Component 
{
  constructor(props) {
    super()
    this.handleClick.bind(this)
  }

  handleClick = (mutation) => {
    const { navigation } = this.props
    mutation().then(results => {
      const { createDataset } = results.data
      navigation.selectDataset(createDataset.id)
    })
  }
  
  render() {
    const { navigation, classes } = this.props

    return (
      <Mutation 
        mutation={CREATE_DATASET}
        variables={{ owner: navigation.currentOrg }}
        refetchQueries={[{ query: datasetListQuery }]}>
        {(mutate, { data }) => (
          <Button 
            className={classes.button}
            onClick={() => this.handleClick(mutate)} 
            color="primary"
          >
            <AddIcon />
            Add New Dataset
          </Button>
        )}
      </Mutation>
    )
  }
}

export default compose(
  withNavigation,
  withStyles(styles)
)(NewDatasetButton)
