import React, { useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@material-ui/core'

import { columnsProptype } from '../../../lib/adiProptypes'

const useStyles = makeStyles((theme) => ({
  tableWrapper: {
    maxHeight: 250,
    overflow: 'auto',
  },
  columnsCompact: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
      '& span': {
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    },
  },
}))

const ColumnSummary = ({ columns }) => {
  const classes = useStyles();
  const [showDetails, setShowDetails] = useState(false)

  const compactView = (
    <div className={classes.columnsCompact}>
      { columns.map((column) => (
        <Chip variant="outlined" size="small" label={column.name} key={column.name} />
      ))}
    </div>
  )

  const detailView = (
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

  return (
    <div>
      { showDetails ? detailView : compactView }
      <Button color="primary" onClick={() => setShowDetails(!showDetails)}>
        { `${showDetails ? 'Hide' : 'Show'} Column Details` }
      </Button>
    </div>
  )
}

ColumnSummary.propTypes = {
  columns: columnsProptype.isRequired
}

export default ColumnSummary
