import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import { updateDatasetColumnsMutation, datasetColumnTagsQuery } from '../queries'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

import DatasetColumnTagsForm from './DatasetColumnTagsForm'

const styles = (theme) => ({
  title: {
    marginBottom: theme.spacing.unit
  }
})

// The actual component that will be exported. Choreographs what will be
// shown on the panel based off of the data and the other components defined
// in this file.
class DatasetColumnTagsContainer extends React.Component {
  render() {
    const { id, classes } = this.props

    return (
      <Mutation
        mutation={updateDatasetColumnsMutation}
        refetchQueries={[
          { query: datasetColumnTagsQuery, variables: { id } }
        ]}
      >
        { updateColumn => (
          <Query query={datasetColumnTagsQuery} variables={{ id }}>
            {({ loading, error, data }) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <p>Error!</p>;

              const columns = data.dataset[0].columns
              // TODO: Create a better empty state for this panel
              if (columns.length == 0) return <div/>
              
              return(
                <div>
                  <Typography variant="headline" className={classes.title}>
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
}

DatasetColumnTagsContainer.propTypes = {
  id: PropTypes.number,
}

export default withStyles(styles)(DatasetColumnTagsContainer)