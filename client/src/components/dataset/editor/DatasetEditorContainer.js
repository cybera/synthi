import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import { ADIButton } from '../../layout/buttons'
import DatasetGenerator from './DatasetGenerator'
import { ToggleVisibility } from '../../common'
import { DownloadButton, UploadButton } from './buttons'
import { TransformationEditor, SaveTransformationButton } from '../transformation'

const styles = theme => ({
  editorButton: {
    marginRight: theme.spacing.unit
  },
  buttonsRight: {
    textAlign: 'right'
  }
})

class DatasetEditor extends React.Component {
  static propTypes = {
    dataset: PropTypes.object,
    dataExists: PropTypes.bool // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    dataset: null
  }

  constructor() {
    super()
    this.transformationEditor = React.createRef()
  }

  transformationCode = () => this.transformationEditor.current.state.code

  render() {
    const { dataset, classes, dataExists } = this.props

    const { inputTransformation } = dataset
    const codeExists = dataset && dataset.computed && inputTransformation
    const virtualTransformation = inputTransformation !== null && inputTransformation.virtual
    return (
      <div className={classes.root}>
        <ToggleVisibility visible={!dataset.computed}>
          <span className={classes.editorButton}>
            <UploadButton uuid={dataset.uuid} type={dataset.type} />
          </span>
        </ToggleVisibility>

        <ToggleVisibility visible={dataset.computed}>
          <ToggleVisibility visible={virtualTransformation}>
            <Typography variant="h6">
              Virtual Transformation (non-editable):
            </Typography>
          </ToggleVisibility>
          <TransformationEditor
            dataset={dataset}
            readOnly={virtualTransformation}
            ref={this.transformationEditor}
          />
        </ToggleVisibility>

        <ToggleVisibility visible={dataExists}>
          <span className={classes.editorButton}>
            <DownloadButton dataset={dataset} />
          </span>
        </ToggleVisibility>

        <div className={classes.buttonsRight}>
          <ToggleVisibility visible={dataset.computed && !virtualTransformation}>
            <span className={classes.editorButton}>
              <SaveTransformationButton dataset={dataset} currentCode={this.transformationCode} />
            </span>
          </ToggleVisibility>

          <DatasetGenerator>
            {({ generateDataset }) => dataset.computed && (
              <span>
                <ADIButton
                  disabled={dataset.generating || !codeExists || (dataset.inputTransformation.error)}
                  onClick={() => generateDataset(dataset.uuid)}
                >
                  Generate!
                </ADIButton>
              </span>
            )}
          </DatasetGenerator>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(DatasetEditor)
