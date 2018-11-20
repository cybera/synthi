import React from 'react'
import PropTypes from 'prop-types'
import { withStyle } from '@material-ui/core/styles'

// Form Components
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import TextField from '@material-ui/core/TextField'
import ChipInput from 'material-ui-chip-input'

// GraphQL & Apollo things
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import * as Ramda from 'ramda'

export const datasetColumnTagsQuery = gql`
query($id: Int!) {
  dataset(id: $id) {
    columns {
      uuid
      name
      tags {
        name
      }
    }
  }
}
`

export const updateDatasetColumnsMutation = gql`
mutation updateColumns($uuid: String, $values: ColumnInput, $tagNames: [String]) {
  updateColumn(
    uuid: $uuid,
    values: $values,
    tagNames: $tagNames
  ) {
    name
  }
}
`

class DatasetColumnTags extends React.Component {
  state = {
    edited: false
  }

  render = () => {
    const {column} = this.props
    
    return (
      <div>{column.name}</div>
    )
  }
}

class DatasetColumnTagsContainer extends React.Component {
  render() {
    const { columns } = this.props
    const columnFields = columns.map((column) => 
      <DatasetColumnTags column={column} key={column.uuid} />
    )

    return (
      <form noValidate autoComplete="off">
        {columnFields}
      </form>
    )
  }
}

const ConnectedDatasetColumnTags = (props) => {
  const { id } = props

  return (
    <Mutation
      mutation={updateDatasetColumnsMutation}
      refetchQueries={[
        { query: datasetColumnTagsQuery, variables: { id } }
      ]}
    >
      { updateColumns => (
        <Query query={datasetColumnTagsQuery} variables={{ id }}>
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error!</p>;

            const columns = data.dataset[0].columns
            
            if (columns.length == 0) {
              return <p>Please upload or generate a dataset to manage columns.</p>
            } else {
              return (<DatasetColumnTagsContainer columns={columns} />)
            }
          }}
        </Query>
      )}
    </Mutation>
  )
}

export default ConnectedDatasetColumnTags