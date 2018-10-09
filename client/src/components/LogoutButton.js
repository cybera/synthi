import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withNavigation } from '../context/NavigationContext'
import ADIButton from './ADIButton'

class LogoutButton extends React.Component {
  handleClick = () => {
    const { navigation } = this.props

    fetch('/logout', { method: 'GET' })
      .then(response => {
        if (response.ok) {
          navigation.setUser(null)
          navigation.selectDataset(null)
          localStorage.removeItem('user')
        }
      })
  };

  render() {
    return (
      <div>
        <ADIButton variant='outlined' onClick={this.handleClick}>Logout</ADIButton>
      </div>
    );
  }
}

export default withNavigation(LogoutButton)
