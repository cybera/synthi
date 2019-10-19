import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/styles'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'

import DatasetFilterContext from '../../../contexts/DatasetFilterContext'

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
        value={value}
        color="primary"
      />
    )}
    label={label}
  />
)

ContextCheckbox.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  setFunction: PropTypes.func.isRequired,
}

const FilterPanel = () => {
  const filter = useContext(DatasetFilterContext)
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography className={classes.title} color="textSecondary" gutterBottom>
        Filter Options
      </Typography>
      <ContextCheckbox
        label="Published Only"
        value={filter.publishedOnly}
        setFunction={filter.setPublishedOnly}
      />
      <ContextCheckbox
        label="From other organizations"
        value={filter.includeShared}
        setFunction={filter.setIncludeShared}
      />
    </div>
  )
}

export default FilterPanel
