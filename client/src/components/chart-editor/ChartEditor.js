import React, {Component} from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import 'react-chart-editor/lib/react-chart-editor.css';

import { createPlotMutation } from '../queries'

import { graphql } from 'react-apollo'
import { compose } from '../lib/common'

class ChartEditor extends Component {
  constructor(props, context) {
    super();

    const { data, layout, frames, config } = props

    this.state = {
      data: data,
      layout: layout,
      frames: frames,
      config: config || { editable: true }
    };
  }

  render() {
    const { dataSources, dataSourceOptions } = this.props

    return (
      <PlotlyEditor
        data={this.state.data}
        layout={this.state.layout}
        config={this.state.config}
        frames={this.state.frames}
        dataSources={dataSources}
        dataSourceOptions={dataSourceOptions}
        plotly={plotly}
        onUpdate={(data, layout, frames) => {
          this.setState({data, layout, frames})
        }}
        useResizeHandler
        debug
        advancedTraceTypeSelector
      />
    );
  }
}

export default ChartEditor