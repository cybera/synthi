import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

import { updateDatasetColumnsMutation, datasetColumnTagsQuery, datasetViewQuery } from '../../../queries'
import DatasetColumnTagsForm from './DatasetColumnTagsForm'
import { PanelLoadingState } from '../../layout'

const styles = theme => ({
  title: {
    marginBottom: theme.spacing(1)
  }
})

// The actual component that will be exported. Choreographs what will be
// shown on the panel based off of the data and the other components defined
// in this file.
const DatasetColumnTagsContainer = (props) => {
  const { uuid, classes } = props

  return (
    <Mutation
      mutation={updateDatasetColumnsMutation}
      refetchQueries={[
        { query: datasetColumnTagsQuery, variables: { uuid } },
        { query: datasetViewQuery, variables: { uuid } }
      ]}
    >
      { updateColumn => (
        <Query query={datasetColumnTagsQuery} variables={{ uuid }}>
          {({ loading, error, data }) => {
            if (loading) return <PanelLoadingState />
            if (error) return <p>Error!</p>

            const { columns } = data.dataset[0]
            // TODO: Create a better empty state for this panel
            if (columns.length === 0) return <div />

            return (
              <div>
                <Typography variant="h5" className={classes.title}>
                  Column Settings
                </Typography>
                <Paper>
                  <DatasetColumnTagsForm columns={columns} saveMutation={updateColumn} />
                </Paper>
              </div>
            )
          }}
        </Query>
      )}
    </Mutation>
  )
}

DatasetColumnTagsContainer.propTypes = {
  uuid: PropTypes.string,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetColumnTagsContainer.defaultProps = {
  uuid: null
}

export default withStyles(styles)(DatasetColumnTagsContainer)
