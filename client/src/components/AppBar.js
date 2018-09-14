import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import LoginDialog from './LoginDialog'
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
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <img src={require('../images/ckan-logo.png')} />
          <span className={classes.spacer}/>
          <ADIButton color="inherit" className={classes.menuButton}
                     disabled={navigation.currentMode == 'datasets'} 
                     onClick={ e => navigation.switchMode('datasets')}>Datasets</ADIButton>
          <ADIButton color="inherit" className={classes.menuButton}
                     disabled={navigation.currentMode == 'chart-editor'} 
                     onClick={ e => navigation.switchMode('chart-editor')}>Chart Editor</ADIButton>
          <ADIButton color="inherit" className={classes.menuButton}
                     disabled={navigation.currentMode == 'scenarios'} 
                     onClick={ e => navigation.switchMode('scenarios')}>Scenarios</ADIButton>
          <span className={classes.flex}/>
          <LoginDialog/>
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