import React from 'react'
import PropTypes from 'prop-types'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

const ConfirmationDialog = (props) => {
  const {
    header,
    content,
    cancelLabel,
    continueLabel,
    hideCancel,
    open,
    onClose
  } = props

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
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
            onClick={() => onClose(false)}
            variant="contained"
            color="default"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          onClick={() => onClose(true)}
          variant="contained"
          color="primary"
        >
          {continueLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
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
