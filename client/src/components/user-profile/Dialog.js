import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import Dialog from '@material-ui/core/Dialog'

import UserProfile from './UserProfile'

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
          <UserProfile user={user} regenerateAPIKey={regenerateAPIKey} />
        </DialogContent>
      </Dialog>
    );
  }
}

UserProfileDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  user: PropTypes.object
};

export default withStyles(styles)(UserProfileDialog)
