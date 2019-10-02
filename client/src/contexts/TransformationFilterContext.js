import React, { useState } from 'react'
import PropTypes from 'prop-types'

const TransformationFilterContext = React.createContext({
  publishedOnly: false,
  setPublishedOnly: () => {}
})

export const TransformationFilterProvider = ({ children }) => {
  const [publishedOnly, setPublishedOnly] = useState(false)
  const [includeShared, setIncludeShared] = useState(true)

  return (
    <TransformationFilterContext.Provider
      value={{
        publishedOnly,
        includeShared,
        setPublishedOnly,
        setIncludeShared,
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
