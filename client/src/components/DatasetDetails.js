import React from 'react'

import ViewIcon from '@material-ui/icons/ViewColumn'
import EditIcon from '@material-ui/icons/Edit'
import TagMultipleIcon from 'mdi-react/TagMultipleIcon'
import ConnectionsIcon from '@material-ui/icons/DeviceHub'
import APIIcon from '@material-ui/icons/ImportExport'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'

import DatasetView from './DatasetView'
import DatasetMetadata from './DatasetMetadata'
import DatasetTree from './DatasetTree'
import APIInfo from './api-info'
import Placeholder from './Placeholder'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

const styles = theme => ({
  header: {
    paddingLeft: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 7,
    paddingBottom: 0
  },
  headerText: {
    marginBottom: theme.spacing.unit * 2
  },
  wrapper: {
    padding: theme.spacing.unit,
  },
  tabs: {
    boxShadow: 'none',
    background: theme.palette.background.paper
  },
  tabIndicator: {
    background: theme.palette.primary.main,
    color: 'red'
  },
  selectedText: {
    color: theme.palette.primary.main
  },
  content: {
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  },
  primary: {},
  icon: {},
});

class DatasetDetails extends React.Component {
  state = {
    value: 0
  }

  handleChange(_, value) {
    this.setState({ value })
  }

  setupMenuOptions(id) {
    // Define the icon and corresponding template for each menu item here
    return [
      {
        name: 'Preview Data',
        icon: <ViewIcon />,
        detailMode: <DatasetView id={id} />
      },
      {
        name: 'Metadata',
        icon: <EditIcon />,
        detailMode: <DatasetMetadata id={id} />
      },
      {
        name: 'Connections',
        icon: <ConnectionsIcon />,
        detailMode: <DatasetTree id={id} />
      },
      {
        name: 'API Info',
        icon: <APIIcon />,
        detailMode: <APIInfo id={id} />
      }
    ]
  }

  showView(value, menuItems) {
    const current = menuItems[value].detailMode
    return current !== undefined ? current : <div />
  }

  render() {
    const { id, classes, navigation } = this.props
    const { value } = this.state
    const options = this.setupMenuOptions(id)
    const tabs = options.map((item) =>
      <Tab key={item.name} label={item.name} classes={{ root: classes.tabsRoot, selected: classes.selectedText}} />
    )

    // TODO: Replace with a better placeholder 
    if (!id) {
      return (
        <div>
          Welcome to ADI. Select a dataset or create a new dataset to begin.
        </div>
      )
    }

    return (
      <div>
        <Paper className={classes.header} square>
          <Typography variant="display1" component="h2" className={classes.headerText}>
            {navigation.currentName}
          </Typography>
          <AppBar 
            position="static" 
            className={classes.tabs} 
            color="default"
          >
            <Tabs 
              value={value} 
              onChange={this.handleChange.bind(this)}
              TabIndicatorProps={{
                className: classes.tabIndicator
              }}
            >
              {tabs}
            </Tabs>
          </AppBar>
        </Paper>
        <div className={classes.wrapper}>
          {this.showView(value, options)}
        </div>
      </div>
    )
  }
}

export default compose(
  withNavigation,
  withStyles(styles)
)(DatasetDetails)