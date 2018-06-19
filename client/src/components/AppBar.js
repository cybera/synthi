import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import LoginDialog from './LoginDialog'
import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'

const styles = {
  root: {
    flexGrow: 1,
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
      <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="title" color="inherit">
            ADI
          </Typography>
          <span className={classes.spacer}/>
          <Button color="inherit" disabled={navigation.currentMode == 'datasets'}
                  onClick={ e => navigation.switchMode('datasets')}>Datasets</Button>
          <Button color="inherit" disabled={navigation.currentMode == 'chart-editor'} 
                  onClick={ e => navigation.switchMode('chart-editor')}>Chart Editor</Button>
          <Button color="inherit" disabled={navigation.currentMode == 'scenarios'} 
                  onClick={ e => navigation.switchMode('scenarios')}>Scenarios</Button>
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