// Adapted from https://github.com/TeamWertarbyte/material-ui-chip-input/blob/master/stories/examples/react-autosuggest.js

import React from 'react'
import PropTypes from 'prop-types'

// Suggestion Components
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import ChipInput from 'material-ui-chip-input'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'

import { withStyles } from '@material-ui/core/styles'

// TODO: Fetch the suggestions from the DB, possibly passed in as a prop to this component
const suggestions = [
  { name: "Float" },
  { name: "Integer" },
  { name: "String" },
  { name: "Boolean" }
]

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3,
    left: 0,
    right: 0
  },
  suggestion: {
    display: 'block'
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  textField: {
    width: '100%'
  }
})

function renderInput (inputProps) {
  const { classes, autoFocus, value, onChange, onAdd, onDelete, chips, ref, ...other } = inputProps

  return (
    <ChipInput
      clearInputValueOnChange
      onUpdateInput={onChange}
      onAdd={onAdd}
      onDelete={onDelete}
      value={chips}
      inputRef={ref}
      {...other}
  />
  )
}

function renderSuggestion (suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.name, query)
  const parts = parse(suggestion.name, matches)

  return (
    <MenuItem
      selected={isHighlighted}
      component='div'
      onMouseDown={(e) => e.preventDefault()} // prevent the click causing the input to be blurred
    >
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </strong>
          )
        })}
      </div>
    </MenuItem>
  )
}

function renderSuggestionsContainer (options) {
  const { containerProps, children } = options

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  )
}

function getSuggestions (value) {
  const inputValue = value.trim().toLowerCase()
  const inputLength = inputValue.length
  let count = 0

  return inputLength === 0
    ? []
    : suggestions.filter(suggestion => {
      const keep =
          count < 5 && suggestion.name.toLowerCase().slice(0, inputLength) === inputValue

      if (keep) {
        count += 1
      }

      return keep
    })
}

function getSuggestionValue (suggestion) {
  return suggestion.name
}

class TagAutosuggestChipInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      suggestions: [],
      value: props.savedTags,
      textFieldInput: ''
    }
  }

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    })
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  };

  handletextFieldInputChange = (event, { newValue }) => {
    this.setState({
      textFieldInput: newValue
    })
  };

  handleAddChip (chip) {
    const temp = [...this.state.value, chip]

    this.setState({
      value: temp,
      textFieldInput: ''
    })

    this.props.onTagChange(temp)
  }

  handleDeleteChip (chip, index) {
    let temp = this.state.value
    temp.splice(index, 1)
    this.setState({value: temp})

    this.props.onTagChange(temp)
  }

  render () {
    const { classes, savedTags, onTagChange, ...rest } = this.props

    return (
      <Autosuggest
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion
        }}
        renderInputComponent={renderInput}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={(e, {suggestionValue}) => { this.handleAddChip(suggestionValue); e.preventDefault() }}
        focusInputOnSuggestionClick={false}
        inputProps={{
          classes,
          chips: this.state.value,
          onChange: this.handletextFieldInputChange,
          value: this.state.textFieldInput,
          onAdd: (chip) => this.handleAddChip(chip),
          onDelete: (chip, index) => this.handleDeleteChip(chip, index),
          ...rest
        }}
      />
    )
  }
}

TagAutosuggestChipInput.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(TagAutosuggestChipInput)