import React from 'react'
import PropTypes from 'prop-types'

import { graphql } from 'react-apollo'

import List from '@material-ui/core/List'
import { withStyles } from '@material-ui/core/styles'
import Pluralize from 'react-pluralize'
import Typography from '@material-ui/core/Typography'

import { compose } from '../lib/common'
import { datasetListQuery, deleteDatasetMutation } from '../queries'
import { withDatasets } from '../containers/DatasetList'
import { withNavigation } from '../context/NavigationContext'

import ConfirmationDialog from './ConfirmationDialog'
import { openSnackbar } from './Notifier'
import DatasetListItem from './DatasetListItem'

const styles = theme => ({
  root: {
    display: 'block',
    position: 'absolute',
    bottom: 0,
    height: 'calc(100% - 178px)',
    width: '100%',
    overflowY: 'auto'
  },
  searchResults: {
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit,
    color: theme.palette.secondary.light,
    textAlign: 'right',
    borderBottom: 'solid 1px',
    borderBottomColor: theme.palette.secondary.light
  }
})

class DatasetList extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    deleteDataset: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      selectDataset: PropTypes.func,
      currentDataset: PropTypes.number,
      currentName: PropTypes.string
    }).isRequired,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    })),
    searchString: PropTypes.string
  }

  static defaultProps = {
    datasets: [],
    searchString: null
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedDataset: {
        id: null,
        name: null
      },
      showDialog: false
    }

    this.handleDelete = this.handleDelete.bind(this)
  }

  handleDeleteDialog = (id, name) => {
    this.setState({
      selectedDataset: {
        id,
        name
      },
      showDialog: true
    });
  }

  handleDelete = (agree) => {
    const { deleteDataset, navigation } = this.props
    const { selectedDataset: { id, name } } = this.state

    this.setState({ showDialog: false })

    if (agree) {
      deleteDataset({
        variables: { id },
        refetchQueries: [{
          query: datasetListQuery,
          variables: { org: { id: navigation.currentOrg } }
        }]
      }).then(() => {
        openSnackbar({ message: `'${name}' was successfully removed.` })
      }).catch((err) => {
        openSnackbar({ message: err })
      })

      if (id === navigation.currentDataset) {
        navigation.selectDataset(null, null)
      }
    }
  }

  render() {
    const {
      navigation,
      datasets,
      classes,
      searchString
    } = this.props

    const { selectedDataset, showDialog } = this.state
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

    return (
      <List component="nav" className={classes.root}>
        {searchString && (
          <Typography variant="body1" className={classes.searchResults}>
            Displaying
            <Pluralize singular="result" count={datasets.length} />
          </Typography>
        )}
        {datasets
          .filter(d => d.owner.id === navigation.currentOrg)
          .sort(collator.compare)
          .reverse()
          .map(({ id, name }) => (
            <DatasetListItem key={id} id={id} name={name} onDelete={this.handleDeleteDialog} />
          ))}

        <ConfirmationDialog
          header={`Remove '${selectedDataset.name}'?`}
          content="Deleting this dataset will permanently destroy all transformations associated with it. Would you like to continue?"
          onClose={this.handleDelete}
          open={showDialog}
        />
      </List>
    )
  }
}

export default compose(
  withDatasets,
  graphql(deleteDatasetMutation, { name: 'deleteDataset' }),
  withNavigation,
  withStyles(styles)
)(DatasetList)
