import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import { compose } from '../lib/common'

import { withNavigation } from '../context/NavigationContext'
import { datasetListQuery } from '../queries'


const CREATE_DATASET = gql`
  mutation CreateDataset($name: String, $owner: String) {
    createDataset(name: $name, owner: $owner) {
      uuid
      name
    }
  }
`

const styles = () => ({
  button: {
    justifyContent: 'left',
    marginBottom: 5,
    width: '100%'
  }
})

class NewDatasetButton extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick.bind(this)
  }

  handleClick = (mutation) => {
    const { navigation } = this.props
    mutation().then((results) => {
      const { createDataset } = results.data
      navigation.selectDataset(createDataset.uuid)
    })
  }

  render() {
    const { navigation, classes } = this.props

    return (
      <Mutation
        mutation={CREATE_DATASET}
        variables={{ owner: navigation.currentOrg }}
        refetchQueries={[{ query: datasetListQuery, variables: { org: { uuid: navigation.currentOrg } } }]}
      >
        {mutate => (
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

NewDatasetButton.propTypes = {
  navigation: PropTypes.objectOf(PropTypes.any).isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

export default compose(
  withNavigation,
  withStyles(styles)
)(NewDatasetButton)
