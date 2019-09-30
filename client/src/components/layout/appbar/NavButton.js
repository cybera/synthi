import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'

import { ADIButton } from '../buttons'
import NavigationContext from '../../../contexts/NavigationContext'

const useStyles = makeStyles({
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
})

const NavButton = ({ label, mode }) => {
  const navigation = useContext(NavigationContext)
  const classes = useStyles()

  return (
    <ADIButton
      variant={navigation.currentMode === mode ? 'contained' : 'outlined'}
      className={classes.menuButton}
      onClick={() => navigation.switchMode(mode)}
    >
      { label }
    </ADIButton>
  )
}

NavButton.propTypes = {
  label: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
}

export default NavButton
