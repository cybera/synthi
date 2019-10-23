import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'

const knownFormats = [
  'csv',
  'pdf',
  'txt',
]

const useStyles = makeStyles({
  formatSelectComponent: {
    width: 200
  },
})

const FormatSelector = ({ format, handleFormatChange }) => {
  const classes = useStyles()

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
      >
        { knownFormats.map((formatValue) => (
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
  handleFormatChange: PropTypes.func.isRequired
}

FormatSelector.defaultProps = {
  format: 'csv'
}

export default FormatSelector
