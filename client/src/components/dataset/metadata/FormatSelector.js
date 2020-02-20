import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'

const SUPPORTED_FORMAT_QUERY = gql`
  query {
    supportedFormats
  }
`

const useStyles = makeStyles({
  formatSelectComponent: {
    width: 200
  },
})

const FormatSelector = ({ format, handleFormatChange, empty }) => {
  const classes = useStyles()

  // Supported formats should rarely change. We're only getting them from the server API
  // to avoid potential inconsistencies of maintaining separate lists in the code. When
  // they do occasionally change, a page refresh will get the new ones. Cache first is
  // the default policy for apollographql, but let's be explicit, in case that changes.
  // Unlike most other queries, we really only want to go to the network if we don't have
  // any values.
  const { loading, data } = useQuery(SUPPORTED_FORMAT_QUERY, { fetchPolicy: 'cache-first' })

  const supportedFormats = loading ? [] : data.supportedFormats

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink htmlFor="format-label-placeholder">
        Format
      </InputLabel>
      <Select
        className={classes.formatSelectComponent}
        value={format}
        onChange={handleFormatChange}
        input={<Input name="format" id="format-label-placeholder" />}
        displayEmpty={Boolean(empty)}
      >
        { empty && <MenuItem value="" key="">{empty}</MenuItem> }
        { supportedFormats.map((formatValue) => (
          <MenuItem value={formatValue} key={formatValue}>
            { formatValue.toUpperCase() }
          </MenuItem>
        ))}
      </Select>
    </FormControl>

  )
}

FormatSelector.propTypes = {
  format: PropTypes.string,
  handleFormatChange: PropTypes.func.isRequired,
  empty: PropTypes.string,
}

FormatSelector.defaultProps = {
  format: 'csv',
  empty: null,
}

export default FormatSelector
