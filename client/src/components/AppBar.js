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
import Sidebar from './Sidebar'


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
    boxShadow: 'none',
    borderBottom: 'solid 1px #e2e2e2'
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
  hide: {
    display: 'none'
  },
  spacer: {
    marginRight: 20
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth
  }
});

class ButtonAppBar extends React.Component {
  state = {
    open: true
  }

  toggleDrawer = () => {
    const current = this.state.open

    this.setState({ open: !current })
  }

  render() {
    const { classes, navigation, children } = this.props;
    const { open } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classNames(classes.appBar, {
          [classes.appBarShift]: open,
        })}>
          <Toolbar disableGutters={!open}>
            <IconButton
              color="default"
              aria-label="View Datasets"
              onClick={this.toggleDrawer}
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
        <Sidebar open={open} handleSidebarToggle={this.toggleDrawer.bind(this)}/>
        <main
          className={classNames(classes.content, {
            [classes.contentShift]: open
          })}>
          {children}
        </main>
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
