import React from 'react'
import StatelessChartEditor from '../components/ChartEditor'
import FetchDataset from '../components/FetchDataset'
import PlotlyDataConverter from '../components/PlotlyDataConverter'
import PlotlySave from '../components/PlotlySave';
import Button from '@material-ui/core/Button';

class ChartEditor extends React.Component {
  constructor(props) {
    super()
    this.editor = React.createRef()
  }

  render() {
    const { datasetID } = this.props

    return (
      <FetchDataset datasetID={datasetID}>
        {({dataset}) => (
          <PlotlySave>
            {({savePlot}) =>
              <PlotlyDataConverter dataset={dataset}>
                {({columns, columnOptions}) => (
                  <div>
                    <StatelessChartEditor dataSources={columns} 
                                          dataSourceOptions={columnOptions}
                                          ref={this.editor} />
                    <Button type='submit' color="primary" onClick={e => savePlot(this.editor.current.state)}>
                      Save Plot
                    </Button>
                  </div>
                )}
              </PlotlyDataConverter>
            }
          </PlotlySave>
        )}
      </FetchDataset>
    )
  }
}

export default ChartEditor