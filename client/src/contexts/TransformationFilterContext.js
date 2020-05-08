import React, { useState } from 'react'
import PropTypes from 'prop-types'

const filterDefaults = {
  publishedOnly: false,
  includeShared: true,
  tags: [],
  searchString: ''
}

const TransformationFilterContext = React.createContext({
  filter: filterDefaults,
  setFilter: () => {},
  updateFilter: () => {}
})

export const TransformationFilterProvider = ({ children }) => {
  const [filter, setFilter] = useState(filterDefaults)
  const updateFilter = (values) => setFilter({ ...filter, ...values })

  return (
    <TransformationFilterContext.Provider
      value={{
        filter,
        setFilter,
        updateFilter
      }}
    >
      { children }
    </TransformationFilterContext.Provider>
  )
}

TransformationFilterProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default TransformationFilterContext
