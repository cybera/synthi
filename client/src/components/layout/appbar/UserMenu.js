import React from 'react'
import PropTypes from 'prop-types'

import AccountCircle from '@material-ui/icons/AccountCircle'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

import { withNavigation } from '../../../contexts/NavigationContext'
import { UserProfileContainer as UserProfileDialog } from '../../user-profile'

class UserMenu extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      setUser: PropTypes.func,
      selectDataset: PropTypes.func
    }).isRequired
  }

  state = {
    anchorEl: null,
    showUserProfile: false
  }

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  openUserProfile = () => {
    this.setState({ showUserProfile: true, anchorEl: null })
  }

  closeUserProfile = () => {
    this.setState({ showUserProfile: false })
  }

  handleClose = () => {
    this.setState({ anchorEl: null });
  }

  handleLogout = () => {
    const { navigation } = this.props

    this.setState({ anchorEl: null })

    fetch('/logout', { method: 'GET' })
      .then((response) => {
        if (response.ok) {
          navigation.setUser(null)
          navigation.selectDataset(null)
          localStorage.removeItem('user')
        }
      })
  }

  render() {
    const { anchorEl, showUserProfile } = this.state
    const open = Boolean(anchorEl)

    return (
      <div>
        <IconButton
          aria-owns={open ? 'menu-appbar' : undefined}
          aria-haspopup="true"
          onClick={this.handleMenu}
          color="primary"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.openUserProfile}>Profile</MenuItem>
          <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
        </Menu>
        <UserProfileDialog
          open={showUserProfile}
          onClose={this.closeUserProfile}
        />
      </div>
    )
  }
}

export default withNavigation(UserMenu)
