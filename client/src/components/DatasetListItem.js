import React from 'react'
import PropTypes from 'prop-types'

import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'

import { compose } from '../lib/common'
import { withNavigation } from '../context/NavigationContext'

const styles = () => ({
  delete: {
    color: 'red'
  }
})

class DatasetListItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDeleting: false
    }

    this.handleDelete = this.handleDelete.bind(this)
  }

  handleDelete(id, name) {
    const { onDelete } = this.props
    onDelete(id, name)
  }

  toggleDeletionIcon() {
    this.setState({ isDeleting: true })
  }

  render() {
    const {
      id,
      name,
      navigation,
      classes
    } = this.props

    const { isDeleting } = this.state

    return (
      <ListItem
        button
        selected={navigation.currentDataset === id}
        onClick={() => navigation.selectDataset(id, name)}
      >
        <ListItemText primary={name} />
        <ListItemSecondaryAction>
          { !isDeleting && (
            <PopupState variant="popover" popupId="dataset-actions">
              {popupState => (
                <React.Fragment>
                  <IconButton {...bindTrigger(popupState)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu {...bindMenu(popupState)}>
                    <MenuItem onClick={popupState.close}>
                      Edit name
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        popupState.close()
                        this.handleDelete(id, name)
                      }}
                    >
                      <span className={classes.delete}>Remove</span>
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              )}
            </PopupState>
          )}
          { isDeleting && <span>Hi</span> }
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}

DatasetListItem.propTypes = {
  onDelete: PropTypes.func.isRequired,
  id: PropTypes.number,
  name: PropTypes.string,
  classes: PropTypes.objectOf(PropTypes.any).isRequired
}

DatasetListItem.defaultProps = {
  id: null,
  name: null
}

export default compose(
  withNavigation,
  withStyles(styles)
)(DatasetListItem)
