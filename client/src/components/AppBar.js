import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import CssBaseline from '@material-ui/core/CssBaseline'

import ADIButton from './ADIButton'
import OrgSelector from './OrgSelector'
import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'
import ADILogo from '../images/ckan-logo.png'
import UserMenu from './UserMenu'

const drawerWidth = 300

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#ffffff',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  flex: {
    flex: 1,
  },
  spacer: {
    marginRight: 20
  },
  hide: {
    display: 'none'
  }
});

class ButtonAppBar extends React.Component {
  state = {
    open: true
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { classes, navigation } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classNames(classes.appBar, {
          [classes.appBarShift]: open,
        })}>
          <Toolbar disableGutters={!open}>
            <IconButton
              color="default"
              aria-lable="View Datasets"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <img alt="" src={ADILogo} />
            <span className={classes.spacer} />
            <ADIButton
              variant={navigation.currentMode === 'datasets' ? 'contained' : 'outlined'}
              className={classes.menuButton}
              onClick={() => navigation.switchMode('datasets')}
            >
              Datasets
            </ADIButton>
            <ADIButton
              variant={navigation.currentMode === 'chart-editor' ? 'contained' : 'outlined'}
              className={classes.menuButton}
              onClick={() => navigation.switchMode('chart-editor')}
            >
              Chart Editor
            </ADIButton>
            <ADIButton
              variant={navigation.currentMode === 'scenarios' ? 'contained' : 'outlined'}
              className={classes.menuButton}
              onClick={() => navigation.switchMode('scenarios')}
            >
              Scenarios
            </ADIButton>
            <span className={classes.flex} />
            <OrgSelector />
            <UserMenu />
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  navigation: PropTypes.shape({ switchMode: PropTypes.func }).isRequired
}

export default compose(
  withStyles(styles),
  withNavigation
)(ButtonAppBar)
