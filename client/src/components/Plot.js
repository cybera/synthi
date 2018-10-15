import React from 'react'
import PropTypes from 'prop-types'

import PlotlyPlot from 'react-plotly.js'

const Plot = (props) => {
  const { data, layout } = props
  return (
    <PlotlyPlot
      data={data}
      layout={layout}
    />
  )
}

Plot.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  layout: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
}

export default Plot
