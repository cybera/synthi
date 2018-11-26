import React from 'react'
import PropTypes from 'prop-types'

import { withNavigation } from '../context/NavigationContext'
import ADIButton from './ADIButton'

class LogoutButton extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      setUser: PropTypes.func,
      selectDataset: PropTypes.func
    }).isRequired
  }

  handleClick = () => {
    const { navigation } = this.props

    fetch('/logout', { method: 'GET' })
      .then((response) => {
        if (response.ok) {
          navigation.setUser(null)
          navigation.selectDataset(null, null)
          localStorage.removeItem('user')
        }
      })
  };

  render() {
    return (
      <div>
        <ADIButton variant="outlined" onClick={this.handleClick}>Logout</ADIButton>
      </div>
    );
  }
}

export default withNavigation(LogoutButton)
