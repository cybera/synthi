import React from 'react'
import StatelessChartEditor from '../components/ChartEditor'
import FetchDataset from '../components/FetchDataset'
import PlotlyDataConverter from '../components/PlotlyDataConverter'

class ChartEditor extends React.Component {
  render() {
    const { datasetID } = this.props

    return (
      <FetchDataset datasetID={datasetID}>
        {({dataset}) => (
          <PlotlyDataConverter dataset={dataset}>
            {({columns, columnOptions}) => (
              <StatelessChartEditor dataSources={columns} 
                                    dataSourceOptions={columnOptions} />
            )}
          </PlotlyDataConverter>
        )}
      </FetchDataset>
    )
  }
}

export default ChartEditor