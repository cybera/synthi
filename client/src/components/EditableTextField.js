import React from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'

class EditableTextField extends React.Component {
  state = {
    editing: false,
    value: ''
  }

  changeMode = (editing) => {
    const { text, commit } = this.props
    const { value } = this.state

    this.setState({ editing, value: text })
    if (!editing) {
      if (value !== text) {
        commit(value)
      }
    }
  }

  handleChange = name => (event) => {
    this.setState({
      [name]: event.target.value,
    })
  }

  keyPress = (event) => {
    if (event.keyCode === 13) {
      this.changeMode(false)
    }
  }

  render() {
    const { text } = this.props
    const { editing, value } = this.state
    if (editing) {
      return (
        <TextField
          id="dataset-name"
          label="Dataset Name"
          value={value}
          onChange={this.handleChange('value')}
          margin="normal"
          variant="outlined"
          autoFocus
          onKeyDown={this.keyPress}
          onBlur={() => this.changeMode(false)}
        />
      )
    }
    // TODO: We should come up with a better way of editing here instead of silencing the warning
    /* eslint-disable jsx-a11y/click-events-have-key-events,
                      jsx-a11y/no-static-element-interactions */
    return <span onClick={() => this.changeMode(true)}>{text}</span>
    /* eslint-enable jsx-a11y/click-events-have-key-events,
                     jsx-a11y/no-static-element-interactions */
  }
}

EditableTextField.propTypes = {
  text: PropTypes.string.isRequired,
  commit: PropTypes.func.isRequired
}

export default EditableTextField
