import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import DatasetColumnTag from './DatasetColumnTag'

const styles = (theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 16,
    marginTop: theme.spacing(1)
  },
  form: {
    marginTop: 10,
    display: 'block'
  }
})

function DatasetColumnTagsForm(props) {
  const { classes, columns, saveMutation } = props
  const columnFields = columns.map((column) =>
    <DatasetColumnTag column={column} key={column.uuid} saveMutation={saveMutation} />
  )

  return (
    <div className={classes.root}>
      <form noValidate autoComplete="off" className={classes.form}>
        {columnFields}
      </form>
    </div>
  )
}

export default withStyles(styles)(DatasetColumnTagsForm)
