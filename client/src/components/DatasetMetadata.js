import React from 'react'

import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { DatePicker } from 'material-ui-pickers'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'

import ADIButton from './ADIButton'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  textArea: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  updateSection: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  amountField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 60
  },
  sourceField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400
  },
  formatSelector: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4,
    width: 200,
  },
  // TODO: Should probably figure out how to do nested styling better
  // in JSS
  formatSelectComponent: {
    width: 200
  },
  dateField: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
})

const LocalDatePicker = (props) => {
  const { label, value, onChange, className } = props
  return (
    <DatePicker
      keyboard
      label={label}
      format="yyyy/MM/dd"
      placeholder="2018/10/10"
      mask={value => (value ? [/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/ ] : [])}
      value={value}
      onChange={onChange}
      disableOpenOnEnter
      className={className}
      animateYearScrolling={false}
    />
  )
}

class DatasetMetadata extends React.Component {
  state = {
    edited: false,
    fields: {
      title: '',
      contributor: '',
      contact: '',
      dateAdded: null,
      dateCreated: null,
      dateUpdated: null,
      updates: null,
      updateFrequencyAmount: 0,
      updateFrequencyUnit: 'weeks',
      format: 'csv',
      description: '',
      source: '',
      identifier: '',
      theme: ''
    }
  }

  handleChange = name => event => {
    let fields = { ...this.state.fields }
    fields[name] = event.target.value

    this.setState({
      fields: fields,
      edited: true
    })
  }

  handleDateChange = name => date => {
    let fields = { ...this.state.fields }
    fields[name] = date

    this.setState({
      fields: fields,
      edited: true
    })
  }

  handeSave = () => {
    this.setState({
      edited: false
    })
    console.log(this.state)
  }

  render() {
    const { id, classes } = this.props
    const { fields } = this.state

    return (
      <div>
        <form className={classes.container} noValidate autoComplete="off">
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <ADIButton 
                onClick={this.handeSave} 
                disabled={!this.state.edited}
              >
                Save
              </ADIButton>
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="metadata-title"
                label="Title"
                className={classes.textField}
                value={fields.title}
                onChange={this.handleChange('title')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="metadata-identifier"
                label="Identifier"
                className={classes.textField}
                value={fields.identifier}
                onChange={this.handleChange('identifier')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="metadata-theme"
                label="Theme"
                className={classes.textField}
                value={fields.theme}
                onChange={this.handleChange('theme')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="metadata-contributor"
                label="Contributor"
                className={classes.textField}
                value={fields.contributor}
                onChange={this.handleChange('contributor')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                id="metadata-contact"
                label="Contact"
                className={classes.textField}
                value={fields.contact}
                onChange={this.handleChange('contact')}
                margin="normal"
              />
            </Grid>
              <Grid item xs={4}>
                <LocalDatePicker
                  label="Date Added"
                  value={fields.dateAdded}
                  onChange={this.handleDateChange('dateAdded')}
                  className={classes.dateField}
                />
              </Grid>
              <Grid item xs={4}>
                <LocalDatePicker
                  label="Date Created"
                  value={fields.dateCreated}
                  onChange={this.handleDateChange('dateCreated')}
                  className={classes.dateField}
                />
              </Grid>
              <Grid item xs={4}>
                <LocalDatePicker
                  label="Date Updated"
                  value={fields.dateUpdated}
                  onChange={this.handleDateChange('dateUpdated')}
                  className={classes.dateField}
                />
              </Grid>
            <Grid item xs={12}>
              <div className={classes.updateSection}>
                <FormControl className={classes.formControl} style={{marginTop: 23}}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={fields.updates}
                        onChange={this.handleChange('updates')}
                        value="updates"
                        color="primary"
                      />
                    }
                    label="Updates every"
                  />
                </FormControl>
                <TextField
                  id="metadata-frequency-amount"
                  label="Amount"
                  className={classes.amountField}
                  value={fields.updateFrequencyAmount}
                  onChange={this.handleChange('updateFrequencyAmount')}
                  margin="normal"
                />
                <FormControl className={classes.formControl} style={{verticalAlign:'bottom', marginBottom:8}}>
                  <Select
                    value={fields.updateFrequencyUnit}
                    onChange={this.handleChange('updateFrequencyUnit')}
                  >
                    <MenuItem value="days">days</MenuItem>
                    <MenuItem value="weeks">weeks</MenuItem>
                    <MenuItem value="months">months</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={classes.formatSelector}>
                <FormControl className={classes.formControl}>
                  <InputLabel shrink htmlFor="format-label-placeholder">
                    Format
                  </InputLabel>
                  <Select
                    className={classes.formatSelectComponent}
                    value={fields.format}
                    onChange={this.handleChange('format')}
                    input={<Input name="format" id="format-label-placeholder" />}
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="metadata-source"
                label="Source"
                className={classes.sourceField}
                value={fields.source}
                onChange={this.handleChange('source')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} style={{paddingRight: 120}}>
              <TextField
                id="metadata-description"
                label="Description"
                multiline
                value={fields.description}
                onChange={this.handleChange('description')}
                className={classes.textArea}
                margin="normal"
                fullWidth
              />
            </Grid>
          </Grid>
        </form>
      </div>
    )
  }
}

export default withStyles(styles)(DatasetMetadata)
