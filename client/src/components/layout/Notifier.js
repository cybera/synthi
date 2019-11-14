import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'

let openSnackbarFn

export default class Notifier extends React.Component {
  state = {
    open: false,
    message: '',
    action: undefined,
    variant: undefined,
  }

  componentDidMount() {
    openSnackbarFn = this.openSnackbar
  }

  openSnackbar = ({ message, action, variant }) => {
    this.setState({
      open: true,
      message,
      action,
      variant,
    })
  }

  handleSnackbarClose = () => {
    this.setState({
      open: false,
      message: '',
      action: undefined,
      variant: undefined,
    })
  }

  render() {
    const { state } = this

    const message = (
      <span
        id="snackbar-message-id"
        dangerouslySetInnerHTML={{ __html: state.message }}
      />
    )

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={message}
        action={state.action}
        variant={state.variant}
        autoHideDuration={3000}
        onClose={this.handleSnackbarClose}
        open={state.open}
        ContentProps={{
          'aria-describedby': 'snackbar-message-id'
        }}
      />
    )
  }
}

export function openSnackbar({ message, action, variant }) {
  openSnackbarFn({ message, action, variant })
}
