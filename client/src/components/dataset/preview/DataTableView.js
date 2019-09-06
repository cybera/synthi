import React from 'react'
import PropTypes from 'prop-types'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

const DataTableView = (props) => {
  const { columns, rows } = props

  return (
    <Table>
      <TableHead>
        <TableRow>
          {
            columns.map(({ uuid, name }) => <TableCell key={uuid}>{ name }</TableCell>)
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          // Many datasets will have no appropriate ID values
          /* eslint-disable react/no-array-index-key */
          rows.map((values, rowIndex) => (
            <TableRow key={rowIndex}>
              {
                values.map((value, columnIndex) => (
                  <TableCell key={columnIndex}>{ value }</TableCell>
                ))
              }
            </TableRow>
          ))
          /* eslint-enable react/no-array-index-key */
        }
      </TableBody>
    </Table>
  )
}

DataTableView.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    name: PropTypes.string
  })),
  rows: PropTypes.arrayOf(PropTypes.array)
}

DataTableView.defaultProps = {
  columns: [],
  rows: []
}

export default DataTableView
