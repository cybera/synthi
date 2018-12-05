import React from 'react'

import ViewIcon from '@material-ui/icons/ViewColumn'
import EditIcon from '@material-ui/icons/Edit'
import TagMultipleIcon from 'mdi-react/TagMultipleIcon'
import ConnectionsIcon from '@material-ui/icons/DeviceHub'
import APIIcon from '@material-ui/icons/ImportExport'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ChartEditor from '../containers/ChartEditor'

import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'

import DatasetView from './DatasetView'
import DatasetMetadata from './DatasetMetadata'
import DatasetTree from './DatasetTree'
import APIInfo from './api-info'
import Placeholder from './Placeholder'

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
  placeholderHeading: {
    marginTop: 15
  }
});

class DatasetDetails extends React.Component {
  state = {
    value: 0
  }

  handleChange(_, value) {
    this.setState({ value })
  }

  render() {
    const { id, classes, navigation } = this.props
    const { value } = this.state
    const options = [
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
        name: 'Chart Editor',
        icon: <ConnectionsIcon />,
        detailMode: <ChartEditor datasetID={id} />
      },
      {
        name: 'API Info',
        icon: <APIIcon />,
        detailMode: <APIInfo id={id} />
      }
    ]
    const tabs = options.map((item) => { 
      return (
        <Tab 
          key={item.name} 
          label={item.name} 
          classes={{ root: classes.tabsRoot, selected: classes.selectedText }} 
        />
      )
    })

    if (!id) {
      return (
        <Placeholder>
          <Typography variant="display1" className={classes.placeholderHeading}>
            Welcome to ADI
          </Typography>
          <Typography variant="subheading">
            Select a dataset or create a new dataset to get started.
          </Typography>
        </Placeholder>
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
          {options[value] !== undefined ? options[value].detailMode : <div />}
        </div>
      </div>
    )
  }
}

export default compose(
  withNavigation,
  withStyles(styles)
)(DatasetDetails)