const PlotlyDataConverter = ({ dataset, children }) => {
  const toRealType = (x) => {
    // Attempts to convert to a number and then checks if that number is NaN to
    // test for a string. Note that Number.isNaN is NOT the same as isNaN. The
    // former explicitly tests for numbers that are NaN, not other objects. See
    // https://github.com/airbnb/javascript#standard-library for why this is used
    // instead of just isNaN(x)
    if (Number.isNaN(Number(x))) {
      return x;
    }
    return (x % 1 === 0) ? parseInt(x, 10) : parseFloat(x)
  }

  const columns = {}

  dataset.columns
    .slice(0) // dup the array to avoid modification error during sort
    .sort((a, b) => a.order - b.order)
    .forEach((c) => {
      columns[c.name] = []
    })

  dataset.rows.forEach((s) => {
    const record = JSON.parse(s)
    Object.keys(record).forEach(k => columns[k].push(toRealType(record[k])))
  })

  const columnOptions = Object.keys(columns).map(name => ({
    value: name,
    label: name,
  }));

  return children({ columns, columnOptions })
}

export default PlotlyDataConverter
