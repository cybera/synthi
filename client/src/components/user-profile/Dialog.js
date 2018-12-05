import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'

import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'

import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import ADIButton from '../ADIButton'

const styles = {
}

class UserProfileDialog extends React.Component {
  handleClose = () => {
    const { onClose } = this.props
    onClose()
  }

  render() {
    const {
      classes,
      onClose,
      user,
      regenerateAPIKey,
      ...other
    } = this.props

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="user-profile-dialog" fullWidth {...other}>
        <DialogTitle id="user-profile-dialog">
          User Profile for {user.username}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={8}>
            <Grid item xs={6}>
              <TextField 
                defaultValue={user.username}
                InputProps={{
                  readOnly: true,
                }}
                margin="normal"
                label="Username"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                defaultValue={user.apikey || " "}
                InputProps={{
                  readOnly: true,
                }}
                margin="normal"
                label="API Key"
                fullWidth
              />
            </Grid>
            <ADIButton onClick={regenerateAPIKey}>Regenerate API Key</ADIButton>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

UserProfileDialog.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired
};

export default withStyles(styles)(UserProfileDialog)
