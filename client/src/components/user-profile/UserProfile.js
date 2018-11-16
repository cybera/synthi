import React from 'react'

import InputLabel from '@material-ui/core/InputLabel'
import Grid from '@material-ui/core/Grid'

import ADIButton from '../ADIButton'

const UserProfile = (props) => {
  const { user, regenerateAPIKey } = props
  return (
    <div>
      <Grid container spacing={24}>
        <Grid container item xs={12}>
          <Grid item xs={6}>
            <InputLabel>Username</InputLabel>
          </Grid>
          <Grid item xs={6}>
            { user.username }
          </Grid>
        </Grid>
        <Grid container item xs={12}>
          <Grid item xs={6}>
            <InputLabel>API Key</InputLabel>
          </Grid>
          <Grid item xs={6}>
            { user.apikey }
          </Grid>
        </Grid>
        <Grid container item xs={12}>
          <ADIButton onClick={regenerateAPIKey}>Regenerate API Key</ADIButton>
        </Grid>
      </Grid>
    </div>
  )
}

export default UserProfile
