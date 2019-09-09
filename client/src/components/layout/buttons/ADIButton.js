import React from 'react'
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
  root: {
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText
    }
  }
})

const ADIButton = props => <Button variant={props.variant || 'contained'} color='primary' {...props}/>


export default withStyles(styles)(ADIButton)
