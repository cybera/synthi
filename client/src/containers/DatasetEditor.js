import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

import ADIButton from '../components/ADIButton'
import DatasetGenerator from '../components/DatasetGenerator'
import ToggleVisibility from '../components/ToggleVisibility'
import DatasetDownloadButton from '../components/dataset/DownloadButton'
import DatasetUploadButton from './DatasetUploadButton'
import TransformationEditor from './TransformationEditor'
import SaveTransformationButton from './SaveTransformationButton'

const styles = theme => ({
  editorButton: {
    marginRight: theme.spacing.unit
  }
})

class DatasetEditor extends React.Component {
  static propTypes = {
    dataset: PropTypes.object // eslint-disable-line react/forbid-prop-types
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
    const { dataset, classes } = this.props

    return (
      <div>
        <ToggleVisibility visible={!dataset.computed}>
          <span className={classes.editorButton}>
            <DatasetUploadButton dataset={dataset} />
          </span>
        </ToggleVisibility>
        <ToggleVisibility visible={dataset.computed}>
          <span className={classes.editorButton}>
            <SaveTransformationButton dataset={dataset} currentCode={this.transformationCode} />
          </span>
        </ToggleVisibility>
        <DatasetGenerator>
          {({ generateDataset }) => dataset.computed && (
            <span className={classes.editorButton}>
              <ADIButton
                disabled={dataset.generating}
                onClick={() => generateDataset(dataset.id)}
              >
                Generate!
              </ADIButton>
            </span>
          )}
        </DatasetGenerator>
        <span className={classes.editorButton}>
          <DatasetDownloadButton dataset={dataset} />
        </span>
        <ToggleVisibility visible={dataset.computed}>
          <TransformationEditor
            dataset={dataset}
            ref={this.transformationEditor}
          />
        </ToggleVisibility>
      </div>
    )
  }
}

export default withStyles(styles)(DatasetEditor)
