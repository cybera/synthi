import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import DatasetColumnTag from './DatasetColumnTag'
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  },
  form: {
    marginTop: '30px',
    display: 'block'
  }
})

class DatasetColumnTagsForm extends React.Component {
  render() {
    const { classes, columns, saveMutation } = this.props
    const columnFields = columns.map((column) => 
      <DatasetColumnTag column={column} key={column.uuid} saveMutation={saveMutation} />
    )

    return (
      <div className={classes.root}>
        <Typography variant="headline">
          Column Metadata
        </Typography>
        <form noValidate autoComplete="off" className={classes.form}>
          {columnFields}
        </form>
      </div>
    )
  }
}

export default withStyles(styles)(DatasetColumnTagsForm)