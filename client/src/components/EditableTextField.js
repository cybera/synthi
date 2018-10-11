import React from 'React'
import TextField from '@material-ui/core/TextField'

class EditableTextField extends React.Component
{
  state = {
    editing: false,
    value: ""
  }

  constructor(props) {
    super()
  }
  
  changeMode = (editing) => {
    this.setState({ editing, value: this.props.text })
    if (!editing) {
      if (this.state.value != this.props.text) {
        this.props.commit(this.state.value)
      }
    }
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    })
  }

  keyPress = (event) => {
    if(event.keyCode == 13) {
      this.changeMode(false)
    }
  }

  render() {
    const { text } = this.props
    const { editing } = this.state
    if (editing) {
      return (
        <TextField
          id="dataset-name"
          label="Dataset Name"
          value={this.state.value}
          onChange={this.handleChange('value')}
          margin="normal"
          variant="outlined"
          autoFocus
          onKeyDown={this.keyPress}
          onBlur={() => this.changeMode(false)}
        />
      )
    } else {
      return  (
        <span onClick={() => this.changeMode(true)}>{text}</span>
      )
    }
  }
}

export default EditableTextField