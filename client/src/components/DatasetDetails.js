import React from 'react'
import PropTypes from 'prop-types'

import ViewIcon from '@material-ui/icons/ViewColumn'
import EditIcon from '@material-ui/icons/Edit'
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
  active: {
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
  constructor(props) {
    super(props)

    this.state = {
      value: 0
    }

    this.handleChange = this.handleChange.bind(this)
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
        detailMode: <ChartEditor datasetID={id} />,
      },
      {
        name: 'API Info',
        icon: <APIIcon />,
        detailMode: <APIInfo id={id} />
      }
    ]
    const tabs = options.map(
      ({ name }) => <Tab key={name} label={name} classes={{ selected: classes.active }} />
    )

    if (!id) {
      return (
        <Placeholder>
          <Typography variant="h4" className={classes.placeholderHeading}>
            Welcome to ADI
          </Typography>
          <Typography variant="subtitle1">
            Select a dataset or create a new dataset to get started.
          </Typography>
        </Placeholder>
      )
    }

    return (
      <div>
        <Paper className={classes.header} square>
          <Typography variant="h4" component="h2" className={classes.headerText}>
            {navigation.currentName}
          </Typography>
          <AppBar
            position="static"
            className={classes.tabs}
            color="default"
          >
            <Tabs
              value={value}
              onChange={this.handleChange}
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

DatasetDetails.propTypes = {
  id: PropTypes.number,
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  navigation: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetDetails.defaultProps = {
  id: null
}

export default compose(
  withNavigation,
  withStyles(styles)
)(DatasetDetails)
