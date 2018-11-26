import React from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles'
import ADIButton from './ADIButton'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

const styles = theme => ({
  input: {
    display: 'none',
  },
})

class UploadFile extends React.Component {
  static propTypes = {
    handleFileChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    text: PropTypes.string
  }

  static defaultProps = {
    text: 'Choose File...'
  }

  handleChange = (event) => {
    const { handleFileChange } = this.props
    const { target: { validity, files: [file] } } = event
    if (validity.valid) {
      handleFileChange(file)
    }
  }

  render() {
    const { classes, text } = this.props

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
        <ADIButton variant="raised" component="span" className={classes.button}>
          <CloudUploadIcon style={{ marginRight: 10, fontSize: '1.45em' }}/>
          { text }
        </ADIButton>
      </label>
    )
  }
}

export default withStyles(styles)(UploadFile)
