import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'

let openSnackbarFn

export default class Notifier extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      message: ''
    }

    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
  }

  componentDidMount() {
    openSnackbarFn = this.openSnackbar
  }

  openSnackbar = ({ message }) => {
    this.setState({
      open: true,
      message
    })
  }

  handleSnackbarClose = () => {
    this.setState({
      open: false,
      message: ''
    })
  }

  render() {
    const { message, open } = this.state

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={message}
        autoHideDuration={3000}
        onClose={this.handleSnackbarClose}
        open={open}
        ContentProps={{
          'aria-describedby': 'snackbar-message-id'
        }}
      >
        <span id="snackbar-message-id">
          {message}
        </span>
      </Snackbar>
    )
  }
}

export function openSnackbar({ message }) {
  openSnackbarFn({ message })
}
