import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import UploadFile from "./UploadFile"
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const uploadDatasetMutation = gql`
mutation UploadDataset($name: String!, $file: Upload!) {
  uploadDataset(name: $name, file: $file) {
    id
    name
  }
}
`

class NewDatasetDialog extends React.Component {
  state = {
    open: false,
    file: null,
    name: null
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleConfirm = () => {
    this.setState({ open: false });
    const { mutate } = this.props

    mutate({ variables: { name: this.state.name, file: this.state.file } })
  };

  handleFileChange = (file) => {
    this.setState({ file: file })
  }

  handleNameChange = (name) => {
    this.setState({ name: name })
  }

  render() {
    const buttonText = this.state.file ? `File: ${this.state.file.name}` : null

    return (
      <div>
        <Button onClick={this.handleClickOpen}>New Dataset</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Upload Dataset</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Choose a CSV file and a name for your dataset.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Dataset name"
              type="text"
              fullWidth
              onChange={e => this.handleNameChange(e.target.value)}
            />
            <UploadFile handleFileChange={this.handleFileChange} text={buttonText}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleConfirm} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default graphql(uploadDatasetMutation)(NewDatasetDialog)