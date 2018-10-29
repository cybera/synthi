import React from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'

import StatelessChartEditor from '../components/ChartEditor'
import FetchDataset from '../components/FetchDataset'
import PlotlyDataConverter from '../components/PlotlyDataConverter'
import PlotlySave from '../components/PlotlySave'
import Placeholder from '../components/Placeholder'

class ChartEditor extends React.Component {
  constructor() {
    super()
    this.editor = React.createRef()
  }

  render() {
    const { datasetID } = this.props

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
                  <div>
                    <StatelessChartEditor
                      dataSources={columns}
                      dataSourceOptions={columnOptions}
                      ref={this.editor}
                    />
                    <Button type="submit" color="primary" onClick={() => savePlot(this.editor.current.state)}>
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
}

ChartEditor.defaultProps = {
  datasetID: null
}

export default ChartEditor
