import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withNavigation } from '../context/NavigationContext'

class LoginDialog extends React.Component {
  state = {
    open: false,
    username: "",
    password: ""
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = (e) => {
    e.preventDefault()

    fetch('/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `username=${this.state.username}&password=${this.state.password}`
    })
    .then(response => response.json())
    .then(obj => this.props.navigation.setUser(obj.user))

    this.handleClose()
  }

  updateUsername = (e) => {
    this.setState({ username: e.target.value })
  }

  updatePassword = (e) => {
    this.setState({ password: e.target.value })
  }

  render() {
    const { navigation } = this.props

    return (
      <div>
        <Button color="inherit" onClick={this.handleClickOpen}>{navigation.user ? 'Logout' : 'Login'}</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Login</DialogTitle>
          <form action="/login" method="POST" onSubmit={this.handleSubmit} >
            <DialogContent>
              <DialogContentText>
                Please enter your login credentials.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="username"
                name="username"
                label="Username"
                type="text"
                fullWidth
                onChange={this.updateUsername}
                value={this.state.username}
              />
              <TextField
                margin="dense"
                id="password"
                name="password"
                label="Password"
                type="password"
                fullWidth
                onChange={this.updatePassword}
                value={this.state.password}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button type='submit' color="primary">
                Login
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

export default withNavigation(LoginDialog)