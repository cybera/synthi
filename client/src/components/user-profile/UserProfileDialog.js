import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import { withStyles } from '@material-ui/core/styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import { ADIButton } from '../layout/buttons'
import { openSnackbar } from '../layout/Notifier'

const styles = {
}

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($password: String!) {
    updatePassword(password: $password)
  }
`

function UpdatePassword() {
  const [updatePassword, { data, error: mutationError }] = useMutation(UPDATE_PASSWORD)
  const [error, setError] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [disabled, setDisabled] = useState('true')

  let input
  let verifyInput

  if (mutationError) {
    openSnackbar({ message: 'Password update failed' })
  } else if (data) {
    openSnackbar({ message: 'Password updated' })
  }

  const verify = () => {
    if (verifyInput.value !== '') {
      if (verifyInput.value === input.value) {
        setDisabled(false)
        setError(false)
        setErrorText('')
      } else {
        setDisabled(true)
        setError(true)
        setErrorText('Password does not match')
      }
    } else {
      setDisabled(true)
      setError(false)
      setErrorText('')
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setDisabled(true)
          updatePassword({ variables: { password: input.value } })
          input.value = ''
          verifyInput.value = ''
        }}
      >
        <TextField
          label="New Password"
          type="password"
          margin="normal"
          defaultValue=""
          fullWidth
          inputRef={(node) => {
            input = node
          }}
          onChange={verify}
        />
        <TextField
          label="Verify Password"
          type="password"
          margin="normal"
          defaultValue=""
          fullWidth
          error={error}
          helperText={errorText}
          inputRef={(node) => {
            verifyInput = node
          }}
          onChange={verify}
        />
        <Grid item xs={12}>
          <ADIButton type="submit" disabled={disabled}>Update Password</ADIButton>
        </Grid>
      </form>
    </div>
  )
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
          User Profile for
          {' '}
          {user.username}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
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
            <Grid item xs={6} />
            <Grid item xs={6}>
              <UpdatePassword />
            </Grid>
            <Grid item xs={12}>
              <TextField
                defaultValue={user.apikey || ''}
                InputProps={{
                  readOnly: true,
                }}
                margin="normal"
                label="API Key"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <ADIButton onClick={regenerateAPIKey}>Regenerate API Key</ADIButton>
            </Grid>
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
