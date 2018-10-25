import React from 'react'

import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { DatePicker } from 'material-ui-pickers'

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
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
})

const LocalDatePicker = (props) => {
  const { label, value, onChange } = props
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
      animateYearScrolling={false}
    />
  )
}

class DatasetMetadata extends React.Component {
  state = {
    edited: false,
    title: '',
    contributor: '',
    contact: '',
    dateAdded: null,
    dateCreated: null,
    dateUpdated: null
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
      edited: true
    })
  }

  handleDateChange = name => date => {
    this.setState({
      [name]: date,
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
            <Grid item xs={12}>
              <TextField
                id="metadata-title"
                label="Title"
                className={classes.textField}
                value={this.state.title}
                onChange={this.handleChange('title')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="metadata-contributor"
                label="Contributor"
                className={classes.textField}
                value={this.state.contributor}
                onChange={this.handleChange('contributor')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="metadata-contact"
                label="Contact"
                className={classes.textField}
                value={this.state.contact}
                onChange={this.handleChange('contact')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <LocalDatePicker
                label="Date Added"
                value={this.state.dateAdded}
                onChange={this.handleDateChange('dateAdded')}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalDatePicker
                label="Date Created"
                value={this.state.dateCreated}
                onChange={this.handleDateChange('dateCreated')}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalDatePicker
                label="Date Updated"
                value={this.state.dateUpdated}
                onChange={this.handleDateChange('dateUpdated')}
              />
            </Grid>
          </Grid>
        </form>
      </div>
    )
  }
}

export default withStyles(styles)(DatasetMetadata)

/*
  x 1. Title
  x 2. Contributor
  x 3. Contact
  x 4. Date Added
  x 5. Date Created
  x 6. Date Updated
  7. Update Frequency
  8. Format
  9. Description
  10. Source
  11. Identifier
*/