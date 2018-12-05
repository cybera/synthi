import React from 'react'
import PropTypes from 'prop-types'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

class ConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose(agree) {
    const { onClose } = this.props
    onClose(agree)
  }

  render() {
    const {
      header,
      content,
      cancelLabel,
      continueLabel,
      hideCancel,
      open
    } = this.props

    return (
      <Dialog
        open={open}
        onClose={this.handleClose}
        aria-labelledby="alert-confirmation-title"
        aria-describedby="alert-confirmation-content"
      >
        <DialogTitle id="alert-dataset-removal-title">
          {header}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dataset-removal-content">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {!hideCancel && (
            <Button
              onClick={() => this.handleClose(false)}
              variant="contained"
              color="default"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            onClick={() => this.handleClose(true)}
            variant="contained"
            color="primary"
          >
            {continueLabel}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

ConfirmationDialog.propTypes = {
  header: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  hideCancel: PropTypes.bool,
  continueLabel: PropTypes.string,
  open: PropTypes.bool.isRequired
}

ConfirmationDialog.defaultProps = {
  continueLabel: 'Continue',
  cancelLabel: 'Cancel',
  hideCancel: false
}

export default ConfirmationDialog
