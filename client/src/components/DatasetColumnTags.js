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

export const datasetColumnTagsQuery = gql`
  query($id: Int!) {
    dataset(id: $id) {
      columns {
        id
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
  mutation updateColumns($uuid: String!, $values: ColumnInput, $tagNames: [String]) {
    updateColumn(
      uuid: $uuid,
      values: $values,
      tagNames: $tagNames
    ) {
      name
    }
  }
`

// Each column in every dataset will have these form fields.
class DatasetColumnTags extends React.Component {
  static defaultProps = {
    tags: [],
    uuid: '',
    name: '',
    id: null
  }

  state = {
    column: {
      name: this.props.column.name,
      tags: this.props.column.tags.map((tag) => tag.name)
    },
    edited: false
  }

  handleTextChange(event) {
    // Made this dynamic in case we add more fields in the future
    const target = event.target
    const value = target.value
    const name = target.id.slice(0,4)
    let newColumnData = { ...this.state.column }

    newColumnData[name] = value

    this.setState({
      column: newColumnData,
      edited: true
    })

    this.handleSave()
  }

  handleTagChange(tagNames) {
    let newColumnData = { ...this.state.column }

    newColumnData['tags'] = tagNames

    this.setState({
      column: newColumnData,
      edited: true
    })

    this.handleSave()
  }

  handleSave() {
    const { name, tags } = this.state.column
    const { saveMutation, uuid } = this.props

    saveMutation({
      variables: {
        uuid,
        values: {
          name
        },
        tagNames: tags
      }
    })

    this.setState({
      edited: false
    })
  }

  render() {
    const { name, tags } = this.state.column
    const { id } = this.props.column

    return (
      <div>
        <TextField
          id={`name${id}`}
          label="Column Name"
          value={name}
          onChange={(event) => this.handleTextChange(event)}
        />
        <ChipInput 
          id={`tags${id}`}
          label="Tags"
          defaultValue={tags}
          onChange={(newTags) => this.handleTagChange(newTags)}
        />
      </div>
    )
  }
}

// Container where the form will be put together, extra logic about saving
// column tags will go here.
class DatasetColumnTagsContainer extends React.Component {
  render() {
    const { columns, saveMutation } = this.props
    const columnFields = columns.map((column) => 
      <DatasetColumnTags column={column} key={column.uuid} saveMutation={saveMutation} />
    )

    console.log(columns)

    return (
      <form noValidate autoComplete="off">
        {columnFields}
      </form>
    )
  }
}

// The actual component that will be exported. Choreographs what will be
// shown on the panel based off of the data and the other components defined
// in this file.
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
            // TODO: Create a better empty state for this panel
            if (columns.length == 0) return <p>Please upload or generate a dataset to manage columns.</p>;
            
            return(<DatasetColumnTagsContainer columns={columns} saveMutation={updateColumns} />)
          }}
        </Query>
      )}
    </Mutation>
  )
}

export default ConnectedDatasetColumnTags