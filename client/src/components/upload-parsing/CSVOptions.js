import React from 'react'

import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import ToggleVisibility from '../ToggleVisibility'
import ADIButton from '../ADIButton'

const DelimiterSelector = (props) => {
  const { handler, delimiter, options } = props

  return (
    <Select
      value={delimiter}
      onChange={handler}
      inputProps={{
        name: 'delimiter',
        id: 'delimiter',
      }}
    >
      { options.map(option => <MenuItem value={option} key={option}>{option}</MenuItem>)}
    </Select>
  )
}

class CSVOptions extends React.Component {
  state = {
    header: true,
    delimiter: 'comma',
    customDelimiter: null
  }

  handleCheckboxChange = name => (event) => {
    this.setState({ [name]: event.target.checked });
  }

  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value })
  }

  render() {
    const { importHandler, id } = this.props
    const { delimiter, header, customDelimiter } = this.state

    return (
      <div>
        <FormGroup row>
          <FormControlLabel
            control={(
              <Switch
                checked={header}
                onChange={this.handleCheckboxChange('header')}
                value="header"
                color="primary"
              />
            )}
            label="Contains header row"
          />
        </FormGroup>
        <FormGroup row>
          <FormControl component="fieldset">
            <FormLabel component="legend">Delimiter</FormLabel>
            <DelimiterSelector
              delimiter={delimiter}
              handler={this.handleChange('delimiter')}
              options={['comma', 'tab', 'semicolon', 'other']}
            />
          </FormControl>
          <ToggleVisibility visible={delimiter === 'other'}>
            <TextField
              value={customDelimiter}
              onChange={this.handleChange('customDelimiter')}
            />
          </ToggleVisibility>
        </FormGroup>
        <FormGroup row>
          <ADIButton
            onClick={
              () => importHandler({
                variables: {
                  id,
                  options: { delimiter, header, customDelimiter }
                }
              })
            }
          >
            Rescan Metadata
          </ADIButton>
        </FormGroup>
      </div>
    )
  }
}

export const importCSVGQL = gql`
  mutation ImportCSV($id: Int!, $options: CSVImportOptions) {
    importCSV(id:$id, removeExisting: true, options: $options) {
      id
      name
    }
  }
`

const ConnectedCSVOptions = props => (
  <Mutation mutation={importCSVGQL}>
    { mutation => <CSVOptions importHandler={mutation} {...props} /> }
  </Mutation>
)

export default ConnectedCSVOptions
