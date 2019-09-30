import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import CssBaseline from '@material-ui/core/CssBaseline'

import OrgSelector from './OrgSelector'
import { withNavigation } from '../../../contexts/NavigationContext'
import { compose } from '../../../lib/common'
import ADILogo from '../../../images/ckan-logo.png'
import UserMenu from './UserMenu'
import NavButton from './NavButton'
import { Sidebar } from '../sidebar'

const drawerWidth = 300

const styles = theme => ({
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

  constructor(props) {
    super(props)

    this.state = {
      open: true
    }

    this.toggleDrawer = this.toggleDrawer.bind(this)
  }

  toggleDrawer = () => {
    const { open } = this.state

    this.setState({ open: !open })
  }

  render() {
    const { classes, navigation, children } = this.props;
    const { open } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, { [classes.appBarShift]: open })}
        >
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
            <NavButton label="Datasets" mode="datasets" />
            <NavButton label="Scenarios" mode="scenarios" />
            <span className={classes.flex} />
            <OrgSelector />
            <UserMenu />
          </Toolbar>
        </AppBar>
        <Sidebar
          open={open}
          handleSidebarToggle={this.toggleDrawer}
        />
        <main
          className={classNames(classes.content, {
            [classes.contentShift]: open
          })}
        >
          {children}
        </main>
      </div>
    );
  }
}

ButtonAppBar.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  navigation: PropTypes.shape({ switchMode: PropTypes.func }).isRequired,
  children: PropTypes.node.isRequired
}

export default compose(
  withStyles(styles),
  withNavigation
)(ButtonAppBar)
