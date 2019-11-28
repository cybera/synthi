import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { withNavigation } from '../../../contexts/NavigationContext'
import { compose } from '../../../lib/common'

const drawerWidth = 320

const styles = (theme) => ({
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

    this.content = props.content

    this.onToggle = this.onToggle.bind(this)
  }

  onToggle() {
    const { handleSidebarToggle } = this.props
    handleSidebarToggle()
  }

  render() {
    const { classes, open } = this.props

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
        {this.content}
      </Drawer>
    )
  }
}

Sidebar.propTypes = {
  handleSidebarToggle: PropTypes.func.isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  content: PropTypes.node.isRequired
}

export default compose(
  withStyles(styles),
  withNavigation
)(Sidebar)