import React from 'react'

import Grid from '@material-ui/core/Grid'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import ViewIcon from '@material-ui/icons/ViewColumn'
import EditIcon from '@material-ui/icons/Edit'
import TagMultipleIcon from 'mdi-react/TagMultipleIcon'
import ConnectionsIcon from '@material-ui/icons/DeviceHub'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'

import DatasetView from './DatasetView'
import DatasetMetadata from './DatasetMetadata'
import DatasetTree from './DatasetTree'
import DatasetColumnTags from './DatasetColumnTags'
import Placeholder from './Placeholder'

const styles = theme => ({
  root: {
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  },
  menuItem: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& $primary, & $icon': {
        color: theme.palette.common.white,
      },
    },
  },
  primary: {},
  icon: {},
});

class DatasetDetails extends React.Component {
  state = {
    mode: 'view'
  }

  changeMode(mode) {
    this.setState({ mode })
  }

  setupMenuOptions(id) {
    // Define the icon and corresponding template for each menu item here
    return [
      {
        name: 'view',
        icon: <ViewIcon />,
        detailMode: <DatasetView id={id} />
      },
      {
        name: 'metadata',
        icon: <EditIcon />,
        detailMode: <DatasetMetadata id={id} />
      },
      {
        name: 'connections',
        icon: <ConnectionsIcon />,
        detailMode: <DatasetTree id={id} />
      },
      {
        name: 'column-tags',
        icon: <TagMultipleIcon />,
        detailMode: <DatasetColumnTags />
      }
    ]
  }

  showView(mode, menuItems) {
    const current = menuItems.find(item => item.name == mode).detailMode
    return current !== undefined ? current : <div />
  }

  render() {
    const { id, classes } = this.props
    const { mode } = this.state
    const options = this.setupMenuOptions(id)
    const menuItems = options.map((item) =>
      <MenuItem key={item.name} className={classes.menuItem} onClick={() => this.changeMode(item.name)} selected={mode == item.name}>
        <ListItemIcon className={classes.icon}>
          {item.icon}
        </ListItemIcon>
      </MenuItem>
    )

    if (!id) {
      return (
        <Placeholder heading="Welcome to ADI">
          Select a dataset or create a new dataset to begin.
        </Placeholder>
      )
    }

    return (
      <Paper className={classes.root} elevation={4}>
        <Grid container spacing={8}>
          <Grid item xs={1}>
            <MenuList>
              {menuItems}
            </MenuList>
          </Grid>
          <Grid item xs={11}>
            { this.showView(mode, options)|| <div /> }
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default withStyles(styles)(DatasetDetails)