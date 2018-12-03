import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import { datasetViewQuery } from '../queries'

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    marginTop: theme.spacing.unit * 5,
    padding: 0
  },
  heading: {
    marginBottom: theme.spacing.unit
  }
})

const DatasetColumnChips = (props) => {
  const { classes, columns, toggleColumnVisibility } = props

  return (
    <div className={classes.root}>
      <Typography 
        variant="title"
        className={classes.heading}
      >
        Enabled Columns
      </Typography>
      <Grid container spacing={8}>
        {columns.map(({ id, name, visible }) => (
          <Grid item key={id}>
            <Chip
              clickable
              color={visible ? 'primary' : 'default'}
              onClick={() => toggleColumnVisibility(id)}
              label={name}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

DatasetColumnChips.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    visible: PropTypes.bool
  })),
  toggleColumnVisibility: PropTypes.func.isRequired
}

DatasetColumnChips.defaultProps = {
  columns: []
}

const toggleColumnVisibility = gql`
  mutation ToggleColumnVisibility($id:Int!) {
    toggleColumnVisibility(id: $id)
  }
`

const DatasetColumnChipsWithToggle = (props) => {
  const { dataset } = props

  const toggle = mutation => id => mutation({
    variables: { id },
    refetchQueries: [
      { query: datasetViewQuery, variables: { id: dataset.id } }
    ]
  })

  return (
    <Mutation mutation={toggleColumnVisibility}>
      { mutation => <DatasetColumnChips toggleColumnVisibility={toggle(mutation)} {...props} />}
    </Mutation>
  )
}

export default withStyles(styles)(DatasetColumnChipsWithToggle)
