import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

import ADIButton from './ADIButton'
import OrgSelector from './OrgSelector'
import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'
import ADILogo from '../images/ckan-logo.png'
import UserMenu from './UserMenu'

const styles = {
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#ffffff'
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  spacer: {
    marginRight: 20
  }
};

function ButtonAppBar(props) {
  const { classes, navigation } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
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

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  navigation: PropTypes.shape({ switchMode: PropTypes.func }).isRequired
}

export default compose(
  withStyles(styles),
  withNavigation
)(ButtonAppBar)
