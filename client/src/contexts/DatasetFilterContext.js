import React, { useState } from 'react'
import PropTypes from 'prop-types'

const DatasetFilterContext = React.createContext({
  publishedOnly: false,
  setPublishedOnly: () => {},
  includeShared: false,
  setIncludeShared: () => {}
})

export const DatasetFilterProvider = ({ children }) => {
  const [publishedOnly, setPublishedOnly] = useState(false)
  const [includeShared, setIncludeShared] = useState(true)

  return (
    <DatasetFilterContext.Provider
      value={{
        publishedOnly,
        includeShared,
        setPublishedOnly,
        setIncludeShared,
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
