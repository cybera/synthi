import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'
import SearchBar from './SearchBar'
import NewDatasetButton from '../containers/NewDatasetButton'
import DatasetList from './DatasetList'

const drawerWidth = 300

const styles = theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper
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
  searchHeader: {

  },
  hide: {
    display: 'none'
  },
  datasetList: {
    position: 'absolute',
    overflowY: 'auto'
  }
})

class Sidebar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      searchString: undefined
    }

    this.onToggle = this.onToggle.bind(this)
  }

  onToggle() {
    const { handleSidebarToggle } = this.props
    handleSidebarToggle()
  }

  render() {
    const { classes, open, navigation } = this.props
    const { searchString } = this.state

    return (
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
          <IconButton onClick={this.onToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <div className={classes.searchHeader}>
          <SearchBar
            onChange={value => this.setState({ searchString: value })}
            onCancelSearch={() => this.setState({ searchString: undefined })}
          />
          <NewDatasetButton />
        </div>
        <DatasetList searchString={searchString} organization={{ id: navigation.currentOrg }} />
      </Drawer>
    )
  }
}

Sidebar.propTypes = {
  handleSidebarToggle: PropTypes.func.isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  navigation: PropTypes.objectOf(PropTypes.any).isRequired
}

export default compose(
  withStyles(styles),
  withNavigation
)(Sidebar)
