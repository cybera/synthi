import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

class ConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);

    this.handleClickOpen = this.handleClickOpen.bind(this);

    this.state = {
      open: false
    }
  }

  componentDidMount() {
    this.props.onOpen(this.handleClickOpen);
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  }

  handleClose = (agree) => {
    this.setState({ open: false });

    if (agree) {
      this.props.onClose();
    }
  }

  render() {
    const { header, content, cancelLabel, continueLabel, hideCancel } = this.props;

    return (
      <Dialog
        open={this.state.open}
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
          {!hideCancel && 
            <Button 
              onClick={() => this.handleClose(false)} 
              variant="contained" 
              color="default"
            >
              {cancelLabel}
            </Button>
          }
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
  disagreeLabel: PropTypes.string,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  hideCancel: PropTypes.bool
}

ConfirmationDialog.defaultProps = {
  continueLabel: "Continue",
  cancelLabel: "Cancel",
  hideCancel: false
}

export default ConfirmationDialog;