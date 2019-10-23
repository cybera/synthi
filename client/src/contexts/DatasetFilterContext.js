import React, { useState } from 'react'
import PropTypes from 'prop-types'

const DatasetFilterContext = React.createContext({
  publishedOnly: false,
  setPublishedOnly: () => {},
  includeShared: false,
  setIncludeShared: () => {},
  format: '',
  setFormat: () => {},
})

export const DatasetFilterProvider = ({ children }) => {
  const [publishedOnly, setPublishedOnly] = useState(false)
  const [includeShared, setIncludeShared] = useState(true)
  const [format, setFormat] = useState('')

  return (
    <DatasetFilterContext.Provider
      value={{
        publishedOnly,
        includeShared,
        setPublishedOnly,
        setIncludeShared,
        format,
        setFormat
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
