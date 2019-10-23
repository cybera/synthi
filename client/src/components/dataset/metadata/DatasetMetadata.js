import React from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { DatePicker } from '@material-ui/pickers'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import ChipInput from 'material-ui-chip-input'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import * as Ramda from 'ramda'

import { ADIButton } from '../../layout/buttons'
import DatasetColumnTagsContainer from './DatasetColumnTagsContainer'
import FormatSelector from './FormatSelector'
import { PanelLoadingState } from '../../layout'
import { datasetViewQuery } from '../../../queries'

export const datasetMetadataQuery = gql`
query($uuid: String) {
  dataset(uuid: $uuid) {
    name
    uuid
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
      topic
    }
  }
}
`
export const updateDatasetMetadataMutation = gql`
  mutation UpdateDatasetMetadata($uuid: String!, $metadata: DatasetMetadataInput) {
    updateDatasetMetadata(uuid: $uuid, metadata: $metadata) {
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
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  textArea: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  updateSection: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  amountField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 60
  },
  sourceField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 400
  },
  formatSelector: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    width: 200,
  },
  // TODO: Should probably figure out how to do nested styling better
  // in JSS
  formatSelectComponent: {
    width: 200
  },
  dateField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  paper: {
    padding: theme.spacing(1)
  },
  root: {
    ...theme.mixins.gutters(),
    marginTop: theme.spacing(1),
    paddingTop: 16,
    paddingBottom: 16,
  },
  saveButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(5)
  },
  title: {
    marginBottom: theme.spacing(1)
  }
})

const LocalDatePicker = (props) => {
  const {
    label,
    value,
    onChange,
    className
  } = props

  return (
    <DatePicker
      keyboard
      label={label}
      format="yyyy/MM/dd"
      placeholder="2018/10/10"
      mask={valueToMask => (valueToMask ? [/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/] : [])}
      value={value}
      onChange={onChange}
      disableOpenOnEnter
      className={className}
      animateYearScrolling={false}
    />
  )
}

LocalDatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string
}

LocalDatePicker.defaultProps = {
  className: '',
  value: null
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
      topic: []
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      edited: false,
      // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
      fields: props.fields
    }
  }

  handleChange = convertEvent => name => (event) => {
    const { fields } = this.state

    fields[name] = convertEvent(event)

    this.setState({
      fields,
      edited: true
    })
  }

  handleChipsChange = name => chips => this.handleChange(
    () => chips
  )(name)(chips)

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

  handleSave = (mutation) => {
    const { uuid } = this.props
    const { fields } = this.state

    mutation({
      variables: {
        uuid,
        metadata: fields
      }
    })

    this.setState({
      edited: false
    })
  }

  render() {
    const { uuid, classes, saveMutation } = this.props
    const { fields, edited } = this.state

    return (
      <div className={classes.root}>
        <Typography variant="h5" className={classes.title}>
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
              <Grid item xs={4} />
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
                  value={new Date(fields.dateAdded)}
                  onChange={this.handleDateChange('dateAdded')}
                  className={classes.dateField}
                />
              </Grid>
              <Grid item xs={4}>
                <LocalDatePicker
                  label="Date Created"
                  value={new Date(fields.dateCreated)}
                  onChange={this.handleDateChange('dateCreated')}
                  className={classes.dateField}
                />
              </Grid>
              <Grid item xs={4}>
                <LocalDatePicker
                  label="Date Updated"
                  value={new Date(fields.dateUpdated)}
                  onChange={this.handleDateChange('dateUpdated')}
                  className={classes.dateField}
                />
              </Grid>
              <Grid item xs={12}>
                <div className={classes.updateSection}>
                  <FormControl className={classes.formControl} style={{ marginTop: 23 }}>
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
                  <FormControl className={classes.formControl} style={{ verticalAlign: 'bottom', marginBottom: 8 }}>
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
                  <FormatSelector
                    format={fields.format}
                    handleFormatChange={this.handleStringChange('format')}
                  />
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
              <Grid item xs={12} style={{ paddingRight: 120 }}>
                <ChipInput
                  onChange={chips => this.handleChipsChange('topic')(chips)}
                  defaultValue={fields.topic}
                  margin="normal"
                  fullWidth
                  fullWidthInput
                  label="Topic"
                  style={{ marginLeft: 10 }}
                />
              </Grid>
              <Grid item xs={12} style={{ paddingRight: 120 }}>
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
          disabled={!edited}
          className={classes.saveButton}
        >
          Save Changes
        </ADIButton>
        <DatasetColumnTagsContainer uuid={uuid} />
      </div>
    )
  }
}

DatasetMetadata.propTypes = {
  fields: PropTypes.shape({
    title: PropTypes.string,
    contributor: PropTypes.string,
    contact: PropTypes.string,
    dateAdded: PropTypes.number,
    dateCreated: PropTypes.number,
    dateUpdated: PropTypes.number,
    updates: PropTypes.bool,
    updateFrequencyAmount: PropTypes.number,
    updateFrequencyUnit: PropTypes.string,
    format: PropTypes.string,
    description: PropTypes.string,
    source: PropTypes.string,
    identifier: PropTypes.string,
    theme: PropTypes.string
  }),
  uuid: PropTypes.string.isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  saveMutation: PropTypes.func.isRequired
}

const StyledDatasetMetadata = withStyles(styles)(DatasetMetadata)

const ConnectedDatasetMetadata = (props) => {
  const { uuid } = props

  // Passing a key value to force re-rendering every time this query gets data and tries to pass
  // it as props to the metadata form. See:
  // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
  return (
    <Mutation
      mutation={updateDatasetMetadataMutation}
      refetchQueries={[
        { query: datasetMetadataQuery, variables: { uuid } },
        { query: datasetViewQuery, variables: { uuid } }
      ]}
      awaitRefetchQueries
    >
      { updateDatasetMetadata => (
        <Query
          query={datasetMetadataQuery}
          variables={{ uuid }}
          fetchPolicy="cache-and-network"
        >
          {({ loading, error, data }) => {
            if (loading) return <PanelLoadingState />
            if (error) return <p>Error!</p>;

            const fieldKeys = Object.keys(DatasetMetadata.defaultProps.fields)
            let fields = {}

            if (data.dataset) {
              fields = Ramda.pick(fieldKeys, data.dataset[0].metadata)
              fields = Ramda.reject(field => field == null, fields)
              fields = Ramda.merge(DatasetMetadata.defaultProps.fields, fields)
            }

            return (
              <StyledDatasetMetadata
                key={uuid}
                uuid={uuid}
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

ConnectedDatasetMetadata.propTypes = {
  uuid: PropTypes.string
}

ConnectedDatasetMetadata.defaultProps = {
  uuid: null
}


export default ConnectedDatasetMetadata
