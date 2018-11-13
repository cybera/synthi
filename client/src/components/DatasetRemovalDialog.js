import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

export default class DatasetRemovalDialog extends React.Component {
  constructor(props) {
    super(props);

    this.handleClickOpen = this.handleClickOpen.bind(this);

    this.state = {
      open: false
    }
  }

  componentDidMount() {
    this.props.openDialog(this.handleClickOpen);
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  }

  handleClose = (agree) => {
    const { id, name } = this.props.toRemove;

    this.setState({ open: false });

    if (agree) {
      this.props.onClose(id, name);
    }
  }

  render() {
    return (
      <Dialog
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="alert-dataset-removal-title"
        aria-describedby="alert-dataset-removal-content"
      >
        <DialogTitle id="alert-dataset-removal-title">
          Remove '{this.props.toRemove.name}'?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dataset-removal-content">
            Deleting this dataset will permanently destroy all transformations associated with it. Would you like to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => this.handleClose(false)} 
            variant="contained" 
            color="default">
            Cancel
          </Button>
          <Button 
            onClick={() => this.handleClose(true)} 
            variant="contained" 
            color="primary" 
            autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

DatasetRemovalDialog.propTypes = {
  toRemove: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  openDialog: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}