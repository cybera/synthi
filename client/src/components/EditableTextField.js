import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

const styles = () => ({
  input: {

  }
})

class EditableTextField extends React.Component {
  constructor(props) {
    super(props)

    const { text } = props

    this.state = {
      value: text
    }

    this.keyPress = this.keyPress.bind(this)
  }

  saveChanges = () => {
    const { value } = this.state
    const { commit } = this.props
    commit(value)
  }

  handleChange = (event) => {
    this.setState({
      value: event.target.value,
    })
  }

  keyPress = (event) => {
    if (event.keyCode === 13) {
      this.saveChanges()
    }
  }

  render() {
    const {
      text,
      variant,
      editing,
      classes
    } = this.props

    const { value } = this.state

    if (editing) {
      return (
        <TextField
          value={value}
          className={classes.input}
          onChange={this.handleChange}
          margin="none"
          autoFocus
          onKeyDown={this.keyPress}
        />
      )
    }

    return (
      <Typography
        variant={variant}
        component="span"
      >
        {text}
      </Typography>
    )
  }
}

EditableTextField.propTypes = {
  text: PropTypes.string.isRequired,
  commit: PropTypes.func.isRequired,
  variant: PropTypes.string,
  editing: PropTypes.bool.isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

EditableTextField.defaultProps = {
  variant: 'subtitle1'
}

export default withStyles(styles)(EditableTextField)
