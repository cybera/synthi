import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import TagAutosuggestChipInput from './TagAutosuggestChipInput'

const styles = (theme) => ({
  root: {
    marginBottom: '10px'
  },
  input: {
    paddingTop: '11px',
    paddingBottom: '10px'
  }
})

class DatasetColumnTags extends React.Component {
  static defaultProps = {
    tags: [],
    uuid: '',
    name: '',
    id: null
  }

  state = {
    column: {
      uuid: this.props.column.uuid,
      name: this.props.column.name,
      tags: this.props.column.tags.map((tag) => tag.name)
    },
    edited: false
  }

  handleTextChange(event) {
    // Made this dynamic in case we add more fields in the future
    const target = event.target
    const value = target.value
    const name = target.id.slice(0,4)
    let newColumnData = { ...this.state.column }

    newColumnData[name] = value

    this.setState({
      column: newColumnData,
      edited: true
    })

    this.handleSave(newColumnData)
  }

  handleTagChange(tagNames) {
    let newColumnData = { ...this.state.column }

    newColumnData['tags'] = tagNames

    this.setState({
      column: newColumnData,
      edited: true
    })

    this.handleSave(newColumnData)
  }

  handleSave(newColumnData) {
    const { name, tags, uuid } = newColumnData
    const { saveMutation } = this.props

    saveMutation({
      variables: {
        uuid,
        values: {
          name
        },
        tagNames: tags
      }
    })

    this.setState({
      edited: false
    })
  }

  render() {
    const { name, tags } = this.state.column
    const { id } = this.props.column
    const { classes } = this.props

    return (
      <Grid container spacing={16} className={classes.root} alignContent="stretch">
        <Grid item xs={4} className={classes.root}>
          <TextField
            id={`name${id}`}
            label="Column Name"
            value={name}
            onChange={(event) => this.handleTextChange(event)}
            fullWidth
            inputProps={{
              className: classes.input
            }}
          />
        </Grid>
        <Grid item xs={6} className={classes.root}>
          <TagAutosuggestChipInput 
            id={`tags${id}`}
            label="Tags"
            savedTags={tags}
            onTagChange={this.handleTagChange.bind(this)}
            fullWidth
          />
        </Grid>
        
      </Grid>
    )
  }
}

export default withStyles(styles)(DatasetColumnTags)