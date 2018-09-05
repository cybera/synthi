import React from "react"

import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

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