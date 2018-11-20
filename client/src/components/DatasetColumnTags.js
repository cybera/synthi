import React from 'react'
import PropTypes from 'prop-types'
import { withStyle } from '@material-ui/core/styles'

// Form Components
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import ChipInput from 'material-ui-chip-input'

// GraphQL & Apollo things
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import * as Ramda from 'ramda'

export const datasetColumnTagsQuery = gql`
query($name: String) {
  dataset(name: $name) {
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
  render() {
    return(
      <div>

      </div>
    )
  }
}

export default DatasetColumnTags;