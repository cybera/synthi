import React from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import { compose } from '../lib/common'
import StatelessChartEditor from '../components/ChartEditor'
import FetchDataset from '../components/FetchDataset'
import PlotlyDataConverter from '../components/PlotlyDataConverter'
import PlotlySave from '../components/PlotlySave'
import Placeholder from '../components/Placeholder'

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit
  },
  root: {
    ...theme.mixins.gutters(),
    marginTop: theme.spacing.unit,
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    marginTop: 20
  },
  icon: {
    marginRight: theme.spacing.unit
  }
})

class ChartEditor extends React.Component {
  constructor() {
    super()
    this.editor = React.createRef()
  }

  render() {
    const { datasetID, classes } = this.props

    if (!datasetID) {
      return (
        <Placeholder heading="Chart Editor">
          You need to select a dataset before you can use the chart editor.
        </Placeholder>
      )
    }

    return (
      <FetchDataset datasetID={datasetID}>
        {({ dataset }) => (
          <PlotlySave>
            {({ savePlot }) => (
              <PlotlyDataConverter dataset={dataset}>
                {({ columns, columnOptions }) => (
                  <div className={classes.root}>
                    <Paper className={classes.paper}>
                      <StatelessChartEditor
                        dataSources={columns}
                        dataSourceOptions={columnOptions}
                        ref={this.editor}
                      />
                    </Paper>
                    <Button 
                      type="submit"
                      color="primary"
                      variant="contained"
                      className={classes.button}
                      onClick={() => savePlot(this.editor.current.state)}
                    >
                      <SaveIcon className={classes.icon} />
                      Save Plot
                    </Button>
                  </div>
                )}
              </PlotlyDataConverter>
            )}
          </PlotlySave>
        )}
      </FetchDataset>
    )
  }
}

ChartEditor.propTypes = {
  datasetID: PropTypes.number,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

ChartEditor.defaultProps = {
  datasetID: null
}

export default compose(
  withStyles(styles),
)(ChartEditor)
