import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import { updateDatasetColumnsMutation, datasetColumnTagsQuery } from '../queries'

import DatasetColumnTagsForm from './DatasetColumnTagsForm'

// The actual component that will be exported. Choreographs what will be
// shown on the panel based off of the data and the other components defined
// in this file.
const DatasetColumnTagsContainer = (props) => {
  const { id } = props

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
            if (columns.length == 0) return <p>Please upload or generate a dataset to manage columns.</p>;
            
            return(<DatasetColumnTagsForm columns={columns} saveMutation={updateColumn} />)
          }}
        </Query>
      )}
    </Mutation>
  )
}

DatasetColumnTagsContainer.propTypes = {
  id: PropTypes.number,
}

export default DatasetColumnTagsContainer