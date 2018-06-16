import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import NavigationContext from '../context/NavigationContext';

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
  const { classes } = props;
  return (
    <div className={classes.root}>
      <NavigationContext.Consumer>
        { ({ switchMode, currentMode }) => 

          <AppBar position="static">
            <Toolbar>
              <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="title" color="inherit">
                ADI
              </Typography>
              <span className={classes.spacer}/>
              <Button color="inherit" disabled={currentMode == 'browser'}
                      onClick={ e => switchMode('browser')}>Datasets</Button>
              <Button color="inherit" disabled={currentMode == 'chart-editor'} 
                      onClick={ e => switchMode('chart-editor')}>Chart Editor</Button>
              <span className={classes.flex}/>
              <Button color="inherit">Login</Button>
            </Toolbar>
          </AppBar>
        }
      </NavigationContext.Consumer>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonAppBar);