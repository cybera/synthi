import React, { useContext } from 'react'

import { makeStyles } from '@material-ui/styles'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'

import TransformationFilterContext from '../../contexts/TransformationFilterContext'

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

const FilterPanel = () => {
  const filter = useContext(TransformationFilterContext)
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography className={classes.title} color="textSecondary" gutterBottom>
        Filter Options
      </Typography>
      <FormControlLabel
        control={(
          <Checkbox
            checked={filter.publishedOnly}
            onChange={() => filter.setPublishedOnly(!filter.publishedOnly)}
            value={filter.publishedOnly}
            color="primary"
          />
        )}
        label="Published Only"
      />
    </div>
  )
}

export default FilterPanel
