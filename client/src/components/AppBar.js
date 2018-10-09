import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import LogoutButton from './LogoutButton'
import ADIButton from './ADIButton'

import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'

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
      <AppBar position='static' className={classes.appBar}>
        <Toolbar>
          <img src={require('../images/ckan-logo.png')} />
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
          <LogoutButton />
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
  withNavigation
)(ButtonAppBar)
