import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/styles'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import ChipInput from 'material-ui-chip-input'

import DatasetFilterContext from '../../../contexts/DatasetFilterContext'
import FormatSelector from '../metadata/FormatSelector'

import FileSizeFilter from './FileSizeFilter'
import ADIButton from '../../layout/buttons/ADIButton'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
  },
  title: {
    fontSize: 18,
  },
}))

const ContextCheckbox = ({ label, value, setFunction }) => (
  <FormControlLabel
    control={(
      <Checkbox
        checked={value}
        onChange={() => setFunction(!value)}
        value={label}
        color="primary"
      />
    )}
    label={label}
  />
)

ContextCheckbox.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  setFunction: PropTypes.func.isRequired,
}

const FilterPanel = () => {
  const { filter: currentFilter, updateFilter } = useContext(DatasetFilterContext)
  const [filter, setFilter] = useState(currentFilter)
  const changeFilter = (name) => (value) => setFilter({ ...filter, [name]: value })
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography className={classes.title} color="textSecondary" gutterBottom>
        Filter Options
      </Typography>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <ContextCheckbox
            label="Published Only"
            value={filter.publishedOnly}
            setFunction={changeFilter('publishedOnly')}
          />
          <ContextCheckbox
            label="From other organizations"
            value={filter.includeShared}
            setFunction={changeFilter('includeShared')}
          />
        </Grid>
        <Grid item>
          <FormatSelector
            empty="All Formats"
            format={filter.format}
            handleFormatChange={(e) => changeFilter('format')(e.target.value)}
          />
        </Grid>
        <Grid item>
          <FileSizeFilter
            sizeRange={filter.sizeRange}
            handleUpdatedRange={changeFilter('sizeRange')}
          />
        </Grid>
        <Grid item>
          <ChipInput
            onChange={changeFilter('topics')}
            defaultValue={filter.topics}
            margin="normal"
            fullWidth
            fullWidthInput
            label="Topics"
          />
        </Grid>
        <Grid item>
          <ADIButton onClick={() => updateFilter(filter)}>Filter</ADIButton>
        </Grid>
      </Grid>
    </div>
  )
}

export default FilterPanel
