import React from "react"

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

class DataTableView extends React.Component {
  render() {
    const { columns, rows } = this.props

    return (
      <Table>
        <TableHead>
          <TableRow>
            {
              columns.map(({ id, name }) => <TableCell key={id}>{ name }</TableCell>)
            }                
          </TableRow>
        </TableHead>
        <TableBody>
          {
            rows.map((values, row_index) => (
              <TableRow key={row_index}>
                { 
                  values.map((value, column_index) => ( 
                    <TableCell key={column_index}>{ value }</TableCell>
                  )) 
                }
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    )
  }
}

export default DataTableView