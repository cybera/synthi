import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import {
  CurlBlock,
  PythonBlock,
  RBlock,
  ExcelBlock,
  SASSBlock,
  SPSSBlock,
  MatlabBlock,
  TableauBlock
} from './CodeBlocks'

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    marginRight: theme.spacing.unit
  },
  tabRoot: {
    minWidth: 72,
    textTransform: 'initial'
  }
});

class SimpleTabs extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes, dataset, apikey } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar variant="dense" disableGutters>
            <Tabs value={value} onChange={this.handleChange}>
              <Tab label="cURL" classes={{ root: classes.tabRoot }} />
              <Tab label="Python" classes={{ root: classes.tabRoot }} />
              <Tab label="R" classes={{ root: classes.tabRoot }} />
              <Tab label="Excel" classes={{ root: classes.tabRoot }} />
              <Tab label="SASS" classes={{ root: classes.tabRoot }} />
              <Tab label="SPSS" classes={{ root: classes.tabRoot }} />
              <Tab label="Matlab" classes={{ root: classes.tabRoot }} />
              <Tab label="Tableau" classes={{ root: classes.tabRoot }} />
            </Tabs>
          </Toolbar>
        </AppBar>
        {value === 0 && <TabContainer><CurlBlock dataset={dataset} apikey={apikey} /></TabContainer>}
        {value === 1 && <TabContainer><PythonBlock dataset={dataset} apikey={apikey} /></TabContainer>}
        {value === 2 && <TabContainer><RBlock dataset={dataset} apikey={apikey} /></TabContainer>}
        {value === 3 && <TabContainer><ExcelBlock dataset={dataset} apikey={apikey} /></TabContainer>}        
        {value === 4 && <TabContainer><SASSBlock dataset={dataset} apikey={apikey} /></TabContainer>}
        {value === 5 && <TabContainer><SPSSBlock dataset={dataset} apikey={apikey} /></TabContainer>}
        {value === 6 && <TabContainer><MatlabBlock dataset={dataset} apikey={apikey} /></TabContainer>}
        {value === 7 && <TabContainer><TableauBlock dataset={dataset} apikey={apikey} /></TabContainer>}
      </div>
    );
  }
}

SimpleTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTabs)
