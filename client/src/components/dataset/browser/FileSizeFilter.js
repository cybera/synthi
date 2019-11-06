import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import {
  FormControl,
  Select,
  OutlinedInput,
  MenuItem,
  Typography,
  TextField,
  Grid
} from '@material-ui/core'

const useStyles = makeStyles({
  alignContainer: {
    display: 'flex'
  },
  center: {
    alignSelf: 'center'
  },
  input: {
    paddingTop: 10,
    paddingBottom: 11,
    paddingLeft: 10,
    paddingRight: 26,
    width: 26
  }
})

const UnitSelector = ({ unit, handleUnitUpdate }) => {
  const classes = useStyles()

  return (
    <FormControl variant="outlined" className={classes.center} style={{ marginTop: 3 }}>
      <Select
        value={unit}
        onChange={handleUnitUpdate}
        input={<OutlinedInput classes={{ input: classes.input }} />}
      >
        <MenuItem value="kb">KB</MenuItem>
        <MenuItem value="mb">MB</MenuItem>
        <MenuItem value="gb">GB</MenuItem>
      </Select>
    </FormControl>
  )
}

UnitSelector.propTypes = {
  unit: PropTypes.string.isRequired,
  handleUnitUpdate: PropTypes.func.isRequired
}

const FileSizeFilter = ({ sizeRange, handleUpdatedRange }) => {
  const [range, setRange] = useState(sizeRange)
  const classes = useStyles()

  const handleChange = (name, opts = { numeric: false }) => (event) => {
    let { value } = event.target

    if (opts.numeric) {
      if (value) {
        value = parseInt(value, 10)
        if (value < 0) value = 0
      } else if (value === '') {
        value = null
      }
    }

    const updatedRange = { ...range, [name]: value }
    setRange(updatedRange)
    handleUpdatedRange(updatedRange)
  }

  const badRange = range.max && range.min && range.min > range.max

  return (
    <Grid container spacing={1} direction="row">
      <Grid item sm={4}>
        <TextField
          id="min-dataset-size"
          label="min"
          value={range.min || ''}
          onChange={handleChange('min', { numeric: true })}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          margin="dense"
          variant="outlined"
          error={badRange}
        />
      </Grid>
      <Grid item className={classes.alignContainer}>
        <Typography variant="body1" color="textSecondary" gutterBottom className={classes.center}>
          to
        </Typography>
      </Grid>
      <Grid item sm={4}>
        <TextField
          id="max-dataset-size"
          label="max"
          value={range.max || ''}
          onChange={handleChange('max', { numeric: true })}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          margin="dense"
          variant="outlined"
          error={badRange}
        />
      </Grid>
      <Grid item className={classes.alignContainer}>
        <UnitSelector unit={range.unit} handleUnitUpdate={handleChange('unit')} />
      </Grid>
    </Grid>
  )
}

FileSizeFilter.propTypes = {
  sizeRange: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
    unit: PropTypes.string
  }).isRequired,
  handleUpdatedRange: PropTypes.func.isRequired
}

export default FileSizeFilter
