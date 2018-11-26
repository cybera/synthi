import React from 'react'
import { withNavigation } from '../context/NavigationContext'
import { withStyles } from '@material-ui/core/styles'
import { compose } from '../lib/common'

import DatasetList from './DatasetList'
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider';
import NewDatasetButton from '../containers/NewDatasetButton'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import SearchBar from './SearchBar'

const drawerWidth = 300

const styles = (theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  hide: {
    display: 'none'
  }
})

class Sidebar extends React.Component {
  constructor(props) {
    super(props)
  }

  state = {
    searchString: undefined
  }

  onToggle() {
    this.props.handleSidebarToggle()
  }

  render() {
    const { classes, open } = this.props
    const { searchString } = this.state

    return(
      <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.onToggle.bind(this)}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <SearchBar
            onChange={value => this.setState({ searchString: value })}
            onCancelSearch={() => this.setState({ searchString: undefined })}
          />
          <NewDatasetButton />
          <DatasetList searchString={searchString} />
        </Drawer>
    )
  }
}

export default compose(
  withStyles(styles),
  withNavigation
)(Sidebar)