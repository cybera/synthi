import React, {Component} from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import 'react-chart-editor/lib/react-chart-editor.css';

import Button from 'material-ui/Button';
import { createPlotMutation } from '../queries'

import { graphql } from 'react-apollo'
import { compose } from '../lib/common'

const config = {editable: true};

class ChartEditor extends Component {
  constructor(props, context) {
    super();

    this.state = {
      data: [],
      layout: {},
      frames: []
    };
  }

  handleSave = () => {
    this.props.savePlot({
      variables: {
        data: JSON.stringify(this.state.data),
        layout: JSON.stringify(this.state.layout)
      }, 
      refetchQueries: [
        { query: plotsRetrieveQuery }
      ]
    })
  }

  render() {
    const { dataSources, dataSourceOptions } = this.props

    return (
      <div className="chart-editor-wrapper">
        <PlotlyEditor
          data={this.state.data}
          layout={this.state.layout}
          config={config}
          frames={this.state.frames}
          dataSources={dataSources}
          dataSourceOptions={dataSourceOptions}
          plotly={plotly}
          onUpdate={(data, layout, frames) =>
            this.setState({data, layout, frames})
          }
          useResizeHandler
          debug
          advancedTraceTypeSelector
        />
        <Button type='submit' color="primary" onClick={this.handleSave}>
          Save Plot
        </Button>
      </div>
    );
  }
}

export default compose(
  graphql(createPlotMutation, { name: 'savePlot' }),
)(ChartEditor)