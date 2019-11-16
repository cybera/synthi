import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/styles'
import {
  Checkbox,
  FormControlLabel,
  Typography,
  Grid,
  TextField,
} from '@material-ui/core'
import ChipInput from 'material-ui-chip-input'

import TransformationFilterContext from '../../contexts/TransformationFilterContext'

import ADIButton from '../layout/buttons/ADIButton'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(0),
  },
  title: {
    fontSize: 18,
  },
  optionGrid: {
    width: '100%'
  },
  filterRow: {
    width: '100%'
  },
  filterButton: {
    width: '100%'
  }
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
  const { filter: currentFilter, updateFilter } = useContext(TransformationFilterContext)
  const [filter, setFilter] = useState(currentFilter)
  const changeFilter = (name) => (value) => setFilter({ ...filter, [name]: value })
  const classes = useStyles()

  const filterSubmitOnEnter = (event) => {
    if (event.key === 'Enter') {
      updateFilter(filter)
    }
  }

  return (
    <div className={classes.root}>
      <Typography className={classes.title} color="textSecondary" gutterBottom>
        Filter Options
      </Typography>
      <Grid
        container
        spacing={2}
        direction="column"
        className={classes.optionGrid}
        onKeyPress={filterSubmitOnEnter}
      >
        <Grid item className={classes.filterRow}>
          <TextField
            id="outlined-search"
            label="Search"
            type="search"
            margin="normal"
            variant="outlined"
            fullWidth
            value={filter.searchString}
            onChange={(e) => changeFilter('searchString')(e.target.value)}
          />
        </Grid>
        <Grid item className={classes.filterRow}>
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
        <Grid item className={classes.filterRow}>
          <ChipInput
            onChange={changeFilter('tags')}
            defaultValue={filter.tags}
            margin="normal"
            fullWidth
            fullWidthInput
            label="Tags"
          />
        </Grid>
        <Grid item className={classes.filterRow}>
          <ADIButton
            onClick={() => updateFilter(filter)}
            className={classes.filterButton}
          >
            Filter
          </ADIButton>
        </Grid>
      </Grid>
    </div>
  )
}

export default FilterPanel
