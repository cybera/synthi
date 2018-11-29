import React from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

const styles = theme => ({
  input: {
    display: 'none',
  },
  icon: {
    marginRight: theme.spacing.unit
  }
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
      <span>
        <input
          accept=".csv"
          className={classes.input}
          id="raised-button-file"
          multiple
          type="file"
          onChange={this.handleChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="raised" component="span" color="primary" className={classes.button}>
            <CloudUploadIcon className={classes.icon} />
            { text }
          </Button>
        </label>
      </span>
    )
  }
}

export default withStyles(styles)(UploadFile)
