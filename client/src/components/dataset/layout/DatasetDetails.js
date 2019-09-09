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

import { withNavigation } from '../../../contexts/NavigationContext'
import { compose } from '../../../lib/common'

import { DatasetView } from '../details'
import { DatasetMetadata } from '../metadata'
import { ChartEditor } from '../../chart-editor'
import { DatasetTree } from '../connections'
import { ConnectedPanel as APIInfo } from '../../api-info'
import { ErrorPlaceholder } from '../../layout/warnings'
import { Placeholder } from '../../layout'
import DatasetTitle from './DatasetTitle'

const styles = theme => ({
  header: {
    paddingLeft: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 7,
    paddingBottom: 0
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

  componentDidCatch(error, errorInfo) {
    console.log(error)
    this.setState({hasError: true})
  }

  handleChange(_, value) {
    this.setState({ value, hasError: false })
  }

  render() {
    const { uuid, classes } = this.props
    const { value } = this.state
    const options = [
      {
        name: 'Preview Data',
        icon: <ViewIcon />,
        detailMode: <DatasetView uuid={uuid} />
      },
      {
        name: 'Metadata',
        icon: <EditIcon />,
        detailMode: <DatasetMetadata uuid={uuid} />
      },
      {
        name: 'Connections',
        icon: <ConnectionsIcon />,
        detailMode: <DatasetTree uuid={uuid} />
      },
      {
        name: 'Chart Editor',
        icon: <ConnectionsIcon />,
        detailMode: <ChartEditor datasetUUID={uuid} />,
      },
      {
        name: 'API Info',
        icon: <APIIcon />,
        detailMode: <APIInfo uuid={uuid} />
      }
    ]
    const tabs = options.map(
      ({ name }) => <Tab key={name} label={name} classes={{ selected: classes.active }} />
    )

    if (!uuid) {
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
          <DatasetTitle uuid={uuid} />
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
          {this.state.hasError ? 
            <ErrorPlaceholder>
              <Typography variant="h4" className={classes.placeholderHeading}>
                Oops!
              </Typography>
              <Typography variant="subtitle1">
                We're sorry, something went wrong.
              </Typography>
            </ErrorPlaceholder>
          : 
            options[value] !== undefined ? options[value].detailMode : <div />
          }
        </div>
      </div>
    )
  }
}

DatasetDetails.propTypes = {
  uuid: PropTypes.string,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetDetails.defaultProps = {
  uuid: null
}

export default compose(
  withNavigation,
  withStyles(styles)
)(DatasetDetails)
