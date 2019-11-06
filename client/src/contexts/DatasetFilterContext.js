import React, { useState } from 'react'
import PropTypes from 'prop-types'

const filterDefaults = {
  publishedOnly: false,
  includeShared: true,
  format: '',
  sizeRange: { min: null, max: null, unit: 'kb' },
  topics: [],
  searchString: ''
}

const DatasetFilterContext = React.createContext({
  filter: filterDefaults,
  setFilter: () => {},
  updateFilter: () => {}
})

export const DatasetFilterProvider = ({ children }) => {
  const [filter, setFilter] = useState(filterDefaults)
  const updateFilter = (values) => setFilter({ ...filter, ...values })

  return (
    <DatasetFilterContext.Provider
      value={{
        filter,
        setFilter,
        updateFilter
      }}
    >
      { children }
    </DatasetFilterContext.Provider>
  )
}

DatasetFilterProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default DatasetFilterContext
