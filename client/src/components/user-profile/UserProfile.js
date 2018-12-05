import React from 'react'

import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'

import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import ADIButton from '../ADIButton'


const UserProfile = (props) => {
  const { user, regenerateAPIKey } = props
  return (
    <div>
      <DialogContent>
        <Grid container spacing={8}>
          <Grid container item xs={6}>
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
          <Grid container item xs={12}>
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <ADIButton onClick={regenerateAPIKey}>Regenerate API Key</ADIButton>
      </DialogActions>
    </div>
  )
}

export default UserProfile
