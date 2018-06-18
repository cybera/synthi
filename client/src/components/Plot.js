import React from 'react';
import PlotlyPlot from 'react-plotly.js';

class Plot extends React.Component {
  render() {
    const { data, layout } = this.props
    return (
      <PlotlyPlot
        data={data}
        layout={layout}
      />
    );
  }
}

export default Plot