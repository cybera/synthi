import React from 'react'

import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import LoopIcon from '@material-ui/icons/Loop'

import { withStyles } from '@material-ui/core/styles'

import ToggleVisibility from '../ToggleVisibility'
import ADIButton from '../ADIButton'

const styles = theme => ({
  icon: {
    marginRight: theme.spacing.unit
  }
})

const DelimiterSelector = (props) => {
  const { handler, delimiter, options } = props

  return (
    <Select
      fullWidth
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
    const { importHandler, uuid, classes } = this.props
    const { delimiter, header, customDelimiter } = this.state

    return (
      <div style={{ width: '80%' }}>
        <FormGroup>
          <FormControlLabel
            control={(
              <Switch
                checked={header}
                onChange={this.handleCheckboxChange('header')}
                value="header"
                color="primary"
              />
            )}
            labelPlacement="end"
            label="Does your file contain a header row?"
            fullWidth
          />
        </FormGroup>
        <FormGroup style={{ marginTop: 20 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Which delimiter separates column values?</FormLabel>
            <DelimiterSelector
              delimiter={delimiter}
              handler={this.handleChange('delimiter')}
              options={['comma', 'tab', 'semicolon', 'other']}
            />
          </FormControl>
        </FormGroup>
        <ToggleVisibility visible={delimiter === 'other'}>
          <FormGroup style={{ marginTop: 20 }}>
            <TextField
              value={customDelimiter}
              onChange={this.handleChange('customDelimiter')}
              placeholder="Enter a custom delimiter"
              fullWidth
            />
          </FormGroup>
        </ToggleVisibility>
        <FormGroup style={{ marginTop: 20 }}>
          <div>
            <ADIButton
              fullWidth={false}
              onClick={
                () => importHandler({
                  variables: {
                    uuid,
                    options: { delimiter, header, customDelimiter }
                  }
                })
              }
            >
              <LoopIcon className={classes.icon} />
              Rescan Metadata
            </ADIButton>
          </div>
        </FormGroup>
      </div>
    )
  }
}

export const importCSVGQL = gql`
  mutation ImportCSV($uuid: String!, $options: CSVImportOptions) {
    importCSV(uuid:$uuid, removeExisting: true, options: $options) {
      uuid
      name
    }
  }
`

const ConnectedCSVOptions = props => (
  <Mutation mutation={importCSVGQL}>
    { mutation => <CSVOptions importHandler={mutation} {...props} /> }
  </Mutation>
)

export default withStyles(styles)(ConnectedCSVOptions)
