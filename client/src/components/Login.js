import React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'
import { openSnackbar } from './Notifier'
import ADIButton from './ADIButton'

const styles = theme => ({
  layout: {
    width: 'auto',
    display: 'block', // Fix IE11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  form: {
    width: '100%', // Fix IE11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
  img: {
    paddingBottom: theme.spacing.unit * 2,
  },
})

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      password: '',
      disabled: false
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const { state, props } = this

    this.setState({ disabled: true })

    fetch('/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `username=${state.username}&password=${state.password}`
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Login failed')
      }
      return response.json()
    }).then((obj) => {
      props.navigation.setUser(obj.user)
      localStorage.setItem('user', obj.user)
    }).catch((err) => {
      console.log(err)
      openSnackbar({ message: 'Login failed' })
      this.setState({ disabled: false })
    })
  }

  render() {
    const { state } = this
    const { classes } = this.props
    return (
      <React.Fragment>
        <CssBaseline />
        <main className={classes.layout}>
          <Paper className={classes.paper}>
            <img
              src={require('../images/ckan-logo.png')}
              alt=""
              className={classes.img}
            />
            <Typography component="h1" variant="title" gutterBottom={true}>
              Welcome to the ADI Platform
            </Typography>
            <Typography component="h1" variant="body1">
             Please sign in
            </Typography>
            <form className={classes.form} onSubmit={this.handleSubmit}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="username">Username</InputLabel>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  onChange={this.handleChange}
                  autoFocus
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  name="password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={this.handleChange}
                />
              </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
                style={{ display: 'none' }}
              />
              <ADIButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={state.disabled}
              >
                Sign in
              </ADIButton>
            </form>
          </Paper>
        </main>
      </React.Fragment>
    )
  }
}

const StyledLogin = compose(
  withStyles(styles),
  withNavigation
)(Login)

export default StyledLogin
