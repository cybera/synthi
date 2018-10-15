import React from 'react'
import PropTypes from 'prop-types'

// Simple component to turn visibility of children on/off given
// a property.
const ToggleVisibility = (props) => {
  const { visible, children } = props
  return (
    <React.Fragment>
      { visible && children }
    </React.Fragment>
  )
}

ToggleVisibility.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func
  ]).isRequired,
  visible: PropTypes.bool.isRequired
}

export default ToggleVisibility
