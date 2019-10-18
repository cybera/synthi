import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/styles'

import NavigationContext from '../../../contexts/NavigationContext'
import { ADIButton } from '../buttons'

const useStyles = makeStyles((theme) => ({
  menuButton: {
    minWidth: 120
  },
  expandIcon: {
    marginLeft: theme.spacing(1),
  },
}))


const NavMenuItem = ({ label, mode }) => {
  const navigation = useContext(NavigationContext)

  return (
    <MenuItem onClick={() => navigation.switchMode(mode)}>
      { label }
    </MenuItem>
  )
}

const NavMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const navigation = useContext(NavigationContext)
  const classes = useStyles()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  return (
    <>
      <ADIButton onClick={handleClick} className={classes.menuButton}>
        { navigation.currentMode }
        <ExpandMoreIcon className={classes.expandIcon} />
      </ADIButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <NavMenuItem label="Datasets" mode="datasets" />
        <NavMenuItem label="Transformations" mode="transformations" />
        <NavMenuItem label="Scenarios" mode="scenarios" />
      </Menu>
    </>
  )
}

NavMenuItem.propTypes = {
  label: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
}

export default NavMenu
