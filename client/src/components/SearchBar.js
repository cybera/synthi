import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import MUISearchBar from 'material-ui-search-bar'

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    marginLeft: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit,
    // TODO: Some way to directly base this on button height?
    height: 40
  },
  iconButton: {
    paddingTop: 0,
    paddingBottom: 0
  }
})

const SearchBar = (props) => {
  const { onRequestSearch, onCancelSearch, classes } = props
  return (
    <MUISearchBar
      classes={classes}
      onRequestSearch={onRequestSearch}
      onCancelSearch={onCancelSearch}
    />
  )
}

SearchBar.propTypes = {
  onRequestSearch: PropTypes.func.isRequired,
  onCancelSearch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
}

export default withStyles(styles)(SearchBar)
