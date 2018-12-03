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
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import * as Ramda from 'ramda'

import ADIButton from './ADIButton'
import DatasetColumnTagsContainer from './DatasetColumnTagsContainer'

export const datasetMetadataQuery = gql`
query($id: Int) {
  dataset(id: $id) {
    metadata {
      title
      contributor
      contact
      dateAdded
      dateCreated
      dateUpdated
      updates
      updateFrequencyAmount
      updateFrequencyUnit
      format
      description
      source
      identifier
      theme
    }
  }
}
`
export const updateDatasetMetadataMutation = gql`
  mutation UpdateDatasetMetadata($id: Int!, $metadata: DatasetMetadataInput) {
    updateDatasetMetadata(id: $id, metadata: $metadata) {
      title
    }
  }
`

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
  paper: {
    padding: theme.spacing.unit
  },
  root: {
    ...theme.mixins.gutters(),
    marginTop: theme.spacing.unit,
    paddingTop: 16,
    paddingBottom: 16,
  },
  saveButton: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 5
  },
  title: {
    marginBottom: theme.spacing.unit
  }
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
  static defaultProps = {
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

  state = {
    edited: false,
    // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
    fields: this.props.fields
  }

  handleChange = convertEvent => name => (event) => {
    let fields = { ...this.state.fields }

    fields[name] = convertEvent(event)

    this.setState({
      fields: fields,
      edited: true
    })
  }

  handleStringChange = name => event => this.handleChange(
    e => e.target.value
  )(name)(event)

  handleCheckboxChange = name => event => this.handleChange(
    e => e.target.checked
  )(name)(event)

  handleIntChange = name => event => this.handleChange(
    e => parseInt(e.target.value, 10)
  )(name)(event)

  handleDateChange = name => date => this.handleChange(
    d => d.getTime()
  )(name)(date)

  // handleDateChange = name => (date) => {
  //   let fields = { ...this.state.fields }
  
  //   fields[name] = date.getTime()

  //   this.setState({
  //     fields: fields,
  //     edited: true
  //   })
  // }

  handleSave = (mutation) => {
    const { id } = this.props

    mutation({
      variables: {
        id,
        metadata: this.state.fields
      }
    })

    this.setState({
      edited: false
    })
  }

  render() {
    const { id, classes, saveMutation } = this.props
    const { fields } = this.state

    return (
      <div className={classes.root}>
        <Typography variant="headline" className={classes.title}>
          General
        </Typography>
        <Paper className={classes.paper}>
          <form className={classes.container} noValidate autoComplete="off">
            <Grid container spacing={0}>
              <Grid item xs={4}>
                <TextField
                  id="metadata-title"
                  label="Title"
                  className={classes.textField}
                  value={fields.title}
                  onChange={this.handleStringChange('title')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="metadata-identifier"
                  label="Identifier"
                  className={classes.textField}
                  value={fields.identifier}
                  onChange={this.handleStringChange('identifier')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="metadata-theme"
                  label="Theme"
                  className={classes.textField}
                  value={fields.theme}
                  onChange={this.handleStringChange('theme')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="metadata-contributor"
                  label="Contributor"
                  className={classes.textField}
                  value={fields.contributor}
                  onChange={this.handleStringChange('contributor')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  id="metadata-contact"
                  label="Contact"
                  className={classes.textField}
                  value={fields.contact}
                  onChange={this.handleStringChange('contact')}
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
                      control={(
                        <Checkbox
                          checked={fields.updates}
                          onChange={this.handleCheckboxChange('updates')}
                          value="updates"
                          color="primary"
                        />
                      )}
                      label="Updates every"
                    />
                  </FormControl>
                  <TextField
                    id="metadata-frequency-amount"
                    label="Amount"
                    className={classes.amountField}
                    value={fields.updateFrequencyAmount}
                    onChange={this.handleIntChange('updateFrequencyAmount', parseInt)}
                    margin="normal"
                  />
                  <FormControl className={classes.formControl} style={{verticalAlign:'bottom', marginBottom:8}}>
                    <Select
                      value={fields.updateFrequencyUnit}
                      onChange={this.handleStringChange('updateFrequencyUnit')}
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
                      onChange={this.handleStringChange('format')}
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
                  onChange={this.handleStringChange('source')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} style={{paddingRight: 120}}>
                <TextField
                  id="metadata-description"
                  label="Description"
                  multiline
                  value={fields.description}
                  onChange={this.handleStringChange('description')}
                  className={classes.textArea}
                  margin="normal"
                  fullWidth
                />
              </Grid>
            </Grid>
          </form>
        </Paper>
        <ADIButton 
          onClick={() => this.handleSave(saveMutation)} 
          disabled={!this.state.edited}
          className={classes.saveButton}
        >
          Save Changes
        </ADIButton>
        <DatasetColumnTagsContainer id={id} />
      </div>
    )
  }
}

const StyledDatasetMetadata = withStyles(styles)(DatasetMetadata)

const ConnectedDatasetMetadata = (props) => {
  const { id } = props

  // Passing a key value to force re-rendering every time this query gets data and tries to pass
  // it as props to the metadata form. See:
  // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
  return (
    <Mutation
      mutation={updateDatasetMetadataMutation}
      refetchQueries={[
        { query: datasetMetadataQuery, variables: { id } }
      ]}
    >
      { updateDatasetMetadata => (
        <Query query={datasetMetadataQuery} variables={{ id }}>
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error!</p>;

            const fieldKeys = Object.keys(DatasetMetadata.defaultProps.fields)
            let fields = Ramda.pick(fieldKeys, data.dataset[0].metadata)
            fields = Ramda.reject(field => field == null, fields)
            fields = Ramda.merge(DatasetMetadata.defaultProps.fields, fields)

            return (
              <StyledDatasetMetadata
                key={id}
                id={id}
                fields={fields}
                saveMutation={updateDatasetMetadata}
              />
            )
          }}
        </Query>
      )}
    </Mutation>
  )
}

export default ConnectedDatasetMetadata
