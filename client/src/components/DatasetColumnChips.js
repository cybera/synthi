import React from 'react'
import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import { Mutation } from 'react-apollo'
import gql from "graphql-tag";
import { datasetViewQuery } from '../queries'

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  },
  chip: {
    margin: theme.spacing.unit / 2,
  }
})

const DatasetColumnChips = (props) => {
  const { classes, columns, toggleColumnVisibility } = props

  return <Paper className={classes.root}>
    <Grid container spacing={24}>
      <Grid item xs={12}>
        <Typography variant="subheading" gutterBottom>Columns:</Typography>
      </Grid>
      <Grid item xs={12}>
        {columns.map(({id,name,visible}) => <Chip clickable 
                                                   color={visible ? 'primary' : 'default'} 
                                                   onClick={e => toggleColumnVisibility(id)}
                                                   label={name} 
                                                   key={id}/>)}
      </Grid>
    </Grid>
  </Paper>
}

const toggleColumnVisibility = gql`
  mutation ToggleColumnVisibility($id:Int!) {
    toggleColumnVisibility(id: $id)
  }
`

const DatasetColumnChipsWithToggle = (props) => {
  const toggle = (mutation) => {
    return (id) => {
      return mutation({ 
        variables: { id: id },
        refetchQueries: [
           { query: datasetViewQuery }
        ]
      })
    }
  }

  return <Mutation mutation={toggleColumnVisibility}>
    { mutation => <DatasetColumnChips toggleColumnVisibility={toggle(mutation)} {...props} />}
  </Mutation>
}

export default withStyles(styles)(DatasetColumnChipsWithToggle)