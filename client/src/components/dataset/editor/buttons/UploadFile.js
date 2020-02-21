import React from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import CircularProgress from '@material-ui/core/CircularProgress'

const styles = (theme) => ({
  input: {
    display: 'none',
  },
  icon: {
    marginRight: theme.spacing(1)
  }
})

class UploadFile extends React.Component {
  handleChange = (event) => {
    const { handleFileChange } = this.props
    const { target: { validity, files: [file] } } = event
    if (validity.valid) {
      handleFileChange(file)
    }
  }

  render() {
    const {
      classes,
      text,
      loading,
      uploadTypes
    } = this.props

    return (
      <span>
        <input
          accept={uploadTypes}
          className={classes.input}
          id="raised-button-file"
          multiple
          type="file"
          onChange={this.handleChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" color="primary" className={classes.button}>
            { !loading && <CloudUploadIcon className={classes.icon} />}
            { loading && <CircularProgress className={classes.icon} size={22} color="inherit" />}
            { text }
          </Button>
        </label>
      </span>
    )
  }
}

UploadFile.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  text: PropTypes.string,
  loading: PropTypes.bool.isRequired, // eslint-disable-line react/forbid-prop-types
  uploadTypes: PropTypes.arrayOf(PropTypes.string)
}

UploadFile.defaultProps = {
  text: 'Choose File...',
  uploadTypes: ['.csv']
}

export default withStyles(styles)(UploadFile)
