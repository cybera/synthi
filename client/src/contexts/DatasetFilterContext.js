import React, { useState } from 'react'
import PropTypes from 'prop-types'

const DatasetFilterContext = React.createContext({
  filter: {
    publishedOnly: false,
    includeShared: true,
    format: '',
  },
  setFilter: () => {},
  updateFilter: () => {}
})

export const DatasetFilterProvider = ({ children }) => {
  const [filter, setFilter] = useState({
    publishedOnly: false,
    includeShared: true,
    format: ''
  })
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
