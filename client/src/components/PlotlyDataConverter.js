const PlotlyDataConverter = ({ dataset, children }) => {
  const toRealType = (x) => {
    if (Number.isNaN(x)) {
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
