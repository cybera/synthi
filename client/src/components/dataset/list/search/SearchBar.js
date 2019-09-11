import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import MUISearchBar from 'material-ui-search-bar'

const styles = theme => ({
  root: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
    // TODO: Some way to directly base this on button height?
    height: 40
  },
  iconButton: {
    paddingTop: 0,
    paddingBottom: 0,
    height: 40,
    width: 40,
  }
})

const SearchBar = (props) => {
  const {
    onRequestSearch,
    onCancelSearch,
    onChange,
    classes
  } = props

  return (
    <MUISearchBar
      classes={classes}
      onChange={onChange}
      onRequestSearch={onRequestSearch}
      onCancelSearch={onCancelSearch}
    />
  )
}

SearchBar.propTypes = {
  onRequestSearch: PropTypes.func,
  onCancelSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

SearchBar.defaultProps = {
  onRequestSearch: null,
  onChange: null
}

export default withStyles(styles)(SearchBar)
