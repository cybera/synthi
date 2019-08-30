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
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'

import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'
import { openSnackbar } from './Notifier'
import ADIButton from './ADIButton'
import ADILogo from '../images/ckan-logo.png'

const currentUserQuery = gql`
  query CurrentUser {
    currentUser {
      id
      uuid
      username
      apikey
      organizations {
        id
        uuid
        name
      }
    }
  }
`
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
  hidden: {
    display: 'none'
  }
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
      // NOTE: This may be required again at some point, but now that the issue here:
      // https://github.com/apollographql/apollo-client/issues/4125
      // has been resolved, it looks like I can roll back some rollbacks.
      // props.navigation.setUser(obj.user)
      // localStorage.setItem('user', JSON.stringify(obj.user))
      // let homeOrg = obj.user.orgs.find(o => o.name === obj.user.username)
      // if (!homeOrg) {
      //   [homeOrg] = obj.user.orgs
      // }
      // props.navigation.setOrg(homeOrg.uuid)
      // Now that we have a proper session established, let's grab a proper
      // current user object.
      props.client.query({ query: currentUserQuery }).then(({ data }) => {
        const { currentUser } = data
        currentUser.orgs = currentUser.organizations
        props.navigation.setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))
        let homeOrg = currentUser.orgs.find(o => o.name === currentUser.username)
        if (!homeOrg) {
          [homeOrg] = currentUser.orgs
        }
        props.navigation.setOrg(homeOrg.uuid)
        props.client.resetStore()
      })
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
              src={ADILogo}
              alt=""
              className={classes.img}
            />
            <Typography component="h1" variant="h6" gutterBottom>
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
                className={classes.hidden}
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

Login.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
}

const StyledLogin = compose(
  withStyles(styles),
  withNavigation,
  withApollo
)(Login)

export default StyledLogin
