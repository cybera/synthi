import React from 'react'

import Grid from '@material-ui/core/Grid'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import ViewIcon from '@material-ui/icons/ViewColumn'
import EditIcon from '@material-ui/icons/Edit'
import ConnectionsIcon from '@material-ui/icons/DeviceHub'
import APIIcon from '@material-ui/icons/ImportExport'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'

import DatasetView from './DatasetView'
import DatasetMetadata from './DatasetMetadata'
import DatasetTree from './DatasetTree'
import APIInfo from './api-info'
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

const DetailMode = (props) => {
  const { mode, id } = props

  switch (mode) {
    case 'view':
      return <DatasetView id={id} />
    case 'metadata':
      return <DatasetMetadata id={id} />
    case 'connections':
      return <DatasetTree id={id} />
    case 'api_info':
      return <APIInfo id={id} />
    default:
      return <div />
  }
}

class DatasetDetails extends React.Component {
  state = {
    mode: 'view'
  }

  changeMode(mode) {
    this.setState({ mode })
  }

  render() {
    const { id, classes } = this.props
    const { mode } = this.state

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
              <MenuItem className={classes.menuItem} onClick={() => this.changeMode('view')} selected={mode === 'view'}>
                <ListItemIcon className={classes.icon}>
                  <ViewIcon />
                </ListItemIcon>
              </MenuItem>
              <MenuItem className={classes.menuItem}  onClick={() => this.changeMode('metadata')} selected={mode === 'metadata'}>
                <ListItemIcon className={classes.icon}>
                  <EditIcon />
                </ListItemIcon>
              </MenuItem>
              <MenuItem className={classes.menuItem}  onClick={() => this.changeMode('connections')} selected={mode === 'connections'}>
                <ListItemIcon className={classes.icon}>
                  <ConnectionsIcon />
                </ListItemIcon>
              </MenuItem>
              <MenuItem className={classes.menuItem} onClick={() => this.changeMode('api_info')} selected={mode === 'api_info'}>
                <ListItemIcon className={classes.icon}>
                  <APIIcon />
                </ListItemIcon>
              </MenuItem>
            </MenuList>
          </Grid>
          <Grid item xs={11}>
            <DetailMode id={id} mode={mode} />
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default withStyles(styles)(DatasetDetails)