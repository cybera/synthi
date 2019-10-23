import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import { columnsProptype } from '../../../lib/adiProptypes'

const useStyles = makeStyles({
  tableWrapper: {
    maxHeight: 250,
    overflow: 'auto',
  },
});

const ColumnSummary = ({ columns }) => {
  const classes = useStyles();

  return (
    <div className={classes.tableWrapper}>
      <Table aria-label="simple table" size="small" stickyHeader>
        <colgroup>
          <col width="35%" />
          <col />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Tags</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { columns.map((column) => (
            <TableRow key={column.name}>
              <TableCell component="th" scope="row">
                {column.name}
              </TableCell>
              <TableCell>{column.tags.map((tag) => tag.name).join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

ColumnSummary.propTypes = {
  columns: columnsProptype.isRequired
}

export default ColumnSummary
