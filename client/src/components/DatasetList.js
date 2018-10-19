import React from 'react'
import PropTypes from 'prop-types'

import { graphql } from 'react-apollo'

import List from '@material-ui/core/List'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import { withStyles } from '@material-ui/core/styles'

import { compose } from '../lib/common'
import { datasetListQuery, deleteDatasetMutation } from '../queries'
import { withDatasets } from '../containers/DatasetList'
import { withNavigation } from '../context/NavigationContext'

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  }
})

class DatasetList extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    deleteDataset: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      selectDataset: PropTypes.func,
      currentDataset: PropTypes.number
    }).isRequired,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }))
  }

  static defaultProps = {
    datasets: []
  }

  handleDelete = (id) => {
    const { deleteDataset, navigation } = this.props
    deleteDataset({ variables: { id }, refetchQueries: [{ query: datasetListQuery }] })
    if (id === navigation.currentDataset) {
      navigation.selectDataset(null)
    }
  }

  render() {
    const { navigation, datasets, classes } = this.props

    return (
      <div className={classes.root}>
        <List component="nav">
          {datasets
            .filter(d => d.owner.id === navigation.currentOrg)
            .map(({ id, name }) => (
              <ListItem
                button
                key={id}
                selected={navigation.currentDataset === id}
                onClick={() => navigation.selectDataset(id)}
              >
                <ListItemText primary={name} />
                <ListItemSecondaryAction>
                  <IconButton aria-label="Delete" onClick={e => this.handleDelete(id, e)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </div>
    )
  }
}

export default compose(
  withDatasets,
  graphql(deleteDatasetMutation, { name: 'deleteDataset' }),
  withNavigation,
  withStyles(styles)
)(DatasetList)
