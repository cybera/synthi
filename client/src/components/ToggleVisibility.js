import React from 'react'

// Simple component to turn visibility of children on/off given
// a property.
const ToggleVisibility = (props) => {
  const { visible, children } = props
  return <React.Fragment>
    { visible && children }
  </React.Fragment>
}

export default ToggleVisibility