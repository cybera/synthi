import React from 'react'
import PropTypes from 'prop-types'

import ADIButton from '../components/ADIButton'
import DatasetGenerator from '../components/DatasetGenerator'
import ToggleVisibility from '../components/ToggleVisibility'
import DatasetDownloadButton from '../components/dataset/DownloadButton'
import DatasetUploadButton from './DatasetUploadButton'
import TransformationEditor from './TransformationEditor'
import SaveTransformationButton from './SaveTransformationButton'

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
    const { dataset } = this.props

    return (
      <div>
        <ToggleVisibility visible={!dataset.computed}>
          <DatasetUploadButton dataset={dataset} />
        </ToggleVisibility>
        <ToggleVisibility visible={dataset.computed}>
          <SaveTransformationButton dataset={dataset} currentCode={this.transformationCode} />
        </ToggleVisibility>
        <DatasetGenerator>
          {({ generateDataset }) => dataset.computed && (
            <ADIButton
              disabled={dataset.generating}
              onClick={() => generateDataset(dataset.id)}
            >
              Generate!
            </ADIButton>
          )}
        </DatasetGenerator>
        <DatasetDownloadButton dataset={dataset} />
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

export default DatasetEditor
