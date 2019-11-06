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
  Typography,
  Collapse,
} from '@material-ui/core'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { columnsProptype } from '../../../lib/adiProptypes'

const useStyles = makeStyles((theme) => ({
  showDetailsButton: {
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    textTransform: 'initial',
    '& $columnsHeading': {
      marginBottom: 0,
    },
    '& svg': {
      fontSize: 20,
    },
    marginBottom: theme.spacing(1),
  },
  expandIconCollapsed: {
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  },
  expandIconExpanded: {
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    transform: 'rotate(180deg)'
  },
  columnsHeading: {
    fontSize: 14,
  },
  tableWrapper: {
    maxHeight: 250,
    overflow: 'auto',
  },
  columnsCompact: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      marginRight: theme.spacing(1),
      '& span': {
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    },
  },
}))

const CompactView = ({ columns }) => {
  const classes = useStyles();

  return (
    <div className={classes.columnsCompact}>
      { columns.map((column) => (
        <Chip variant="outlined" size="small" label={column.name} key={column.name} />
      ))}
    </div>
  )
}

const DetailView = ({ columns }) => {
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

const ColumnSummary = ({ columns }) => {
  const classes = useStyles();
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div style={{ display: 'block', clear: 'both' }}>
      <div>
        <Button
          className={classes.showDetailsButton}
          onClick={() => setShowDetails(!showDetails)}
          disableRipple
          color="primary"
        >
          <Typography className={classes.columnsHeading} color="textSecondary" gutterBottom>
            Columns
          </Typography>
          <ExpandMoreIcon
            className={showDetails ? classes.expandIconExpanded : classes.expandIconCollapsed}
          />
        </Button>
      </div>
      <Collapse in={!showDetails}>
        <CompactView columns={columns} />
      </Collapse>
      <Collapse in={showDetails}>
        <DetailView columns={columns} />
      </Collapse>
    </div>
  )
}

ColumnSummary.propTypes = {
  columns: columnsProptype.isRequired
}

CompactView.propTypes = {
  columns: columnsProptype.isRequired
}

DetailView.propTypes = {
  columns: columnsProptype.isRequired
}

export default ColumnSummary
