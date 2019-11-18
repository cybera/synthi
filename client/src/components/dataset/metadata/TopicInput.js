import React from 'react'
import PropTypes from 'prop-types'

import { useQuery } from 'react-apollo'
import gql from 'graphql-tag'

import { AutocompleteChipInput } from '../../layout/form-fields/AutocompleteInput'

export const GET_TOPICS = gql`
  query {
    topics
  }
`

const TopicInput = ({ value, onChange, ...rest }) => {
  const { data, loading, error } = useQuery(GET_TOPICS)

  const topics = loading || error ? [] : data.topics

  return (
    <AutocompleteChipInput
      options={topics}
      onChange={onChange}
      value={value}
      margin="normal"
      label="Topic"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  )
}

TopicInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func
}

TopicInput.defaultProps = {
  value: [],
  onChange: null
}

export default TopicInput
