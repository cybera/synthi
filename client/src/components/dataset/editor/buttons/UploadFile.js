import React from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import CircularProgress from '@material-ui/core/CircularProgress'

const styles = theme => ({
  input: {
    display: 'none',
  },
  icon: {
    marginRight: theme.spacing(1)
  }
})

class UploadFile extends React.Component {
  static propTypes = {
    handleFileChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    text: PropTypes.string,
    loading: PropTypes.bool.isRequired, // eslint-disable-line react/forbid-prop-types
    uploadTypes: PropTypes.arrayOf(PropTypes.string)
  }

  static defaultProps = {
    text: 'Choose File...',
    uploadTypes: ['.csv']
  }

  constructor(props) {
    super(props)
    const { text, loading } = this.props

    this.state = {
      buttonText: text,
      showSpinner: false,
      prevLoadingState: loading
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { loading, text } = props
    const { prevLoadingState } = state

    // TODO: error handling

    /**
     * Datasets have an implicit lifecycle. After the file has been uploaded,
     * some additional processing will still need to be done. However, the mutation that
     * this component is using doesn't know about that extra processing. It
     * just thinks "Alright, this upload has finished, my job here is done",
     * but the UI doesn't update because the dataset's columns are still empty.
     *
     * So, we know that the UI will _not_ update until the columns are finished
     * processing and we know that the mutation only cares about the state of
     * the upload. Therefore, we're assuming for now that if the loading state
     * of the Mutation has gone from `true` to `false`, the dataset has
     * finished uploading and is now being processed.
     *
     * If the component updates again, it will be because the dataset has
     * finished processing and the UI has updated, therefore, the component
     * will be rerendered and we can go back to using the default text and
     * stop showing the spinner.
     */
    const isUploading = loading && !prevLoadingState
    const isProcessing = !loading && prevLoadingState

    if (isProcessing) {
      return {
        buttonText: 'Processing...',
        showSpinner: true,
        prevLoadingState: loading
      }
    } else if (isUploading) {
      return {
        buttonText: 'Uploading File...',
        showSpinner: true,
        prevLoadingState: loading
      }
    }

    // Default state of the button
    return {
      buttonText: text,
      showSpinner: false,
      prevLoadingState: loading
    }
  }

  handleChange = (event) => {
    const { handleFileChange } = this.props
    const { target: { validity, files: [file] } } = event
    if (validity.valid) {
      handleFileChange(file)
    }
  }

  render() {
    const { classes, uploadTypes } = this.props
    const { buttonText, showSpinner } = this.state

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
            { !showSpinner && <CloudUploadIcon className={classes.icon} />}
            { showSpinner && <CircularProgress className={classes.icon} size={22} color="inherit" />}
            { buttonText }
          </Button>
        </label>
      </span>
    )
  }
}

export default withStyles(styles)(UploadFile)
