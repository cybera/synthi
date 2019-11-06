import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/styles'

import NavigationContext from '../../../contexts/NavigationContext'
import { ADIButton } from '../buttons'

function modeToLabel(mode) {
  switch (mode) {
    case 'datasets': return 'Dataset Workbench'
    case 'transformations': return 'Browse Transformations'
    case 'dataset_browser': return 'Browse Datasets'
    case 'scenarios': return 'Scenarios'
    default: return ''
  }
}

const useStyles = makeStyles((theme) => ({
  menuButton: {
    minWidth: 120
  },
  expandIcon: {
    marginLeft: theme.spacing(1),
  },
}))


const NavMenuItem = React.forwardRef(({ label, mode }, ref) => {
  const navigation = useContext(NavigationContext)

  return (
    <MenuItem ref={ref} onClick={() => navigation.switchMode(mode)}>
      { label }
    </MenuItem>
  )
})

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
        { modeToLabel(navigation.currentMode) }
        <ExpandMoreIcon className={classes.expandIcon} />
      </ADIButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <NavMenuItem label={modeToLabel('datasets')} mode="datasets" />
        <NavMenuItem label={modeToLabel('dataset_browser')} mode="dataset_browser" />
        <NavMenuItem label={modeToLabel('transformations')} mode="transformations" />
        <NavMenuItem label={modeToLabel('scenarios')} mode="scenarios" />
      </Menu>
    </>
  )
}

NavMenuItem.propTypes = {
  label: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
}

export default NavMenu
