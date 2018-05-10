import React from "react";
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import Upload from 'material-ui-next-upload/Upload';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';

class UploadFile extends React.Component {
  handleChange = (event) => {
    const { target: { validity, files: [file] } } = event
    validity.valid && this.props.handleFileChange(file)
  }

  render() {
    const { classes, text } = this.props
    const buttonText = text || "Choose File..."

    return (
      <label htmlFor="raised-button-file">
        <input
              accept=".csv"
              className={classes.input}
              id="raised-button-file"
              multiple
              type="file"
              onChange={this.handleChange}
            />
        <Button variant="raised" component="span" className={classes.button}>
          { buttonText }
        </Button>
      </label>
    )
  }
}

export default withStyles(styles)(UploadFile)