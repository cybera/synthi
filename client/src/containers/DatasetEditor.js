import React from 'react'
import ADIButton from '../components/ADIButton'
import DatasetGenerator from '../components/DatasetGenerator'
import ToggleVisibility from '../components/ToggleVisibility'
import DatasetUploadButton from './DatasetUploadButton'
import TransformationEditor from './TransformationEditor'
import SaveTransformationButton from './SaveTransformationButton'

class DatasetEditor extends React.Component {
  constructor(props) {
    super()
    this.transformationEditor = React.createRef()
  }

  transformationCode = () => this.transformationEditor.current.state.code

  render() {
    const { dataset } = this.props

    return (
      <div>
        <ToggleVisibility visible={!dataset.computed}>
          <DatasetUploadButton dataset={dataset}/>
        </ToggleVisibility>
        <ToggleVisibility visible={dataset.computed}>
          <SaveTransformationButton dataset={dataset} currentCode={this.transformationCode}/>
        </ToggleVisibility>
        <DatasetGenerator>
          {({generateDataset}) => {
            return dataset.computed && <ADIButton disabled={dataset.generating} onClick={e => generateDataset(dataset.id)}>Generate!</ADIButton>
          }}
        </DatasetGenerator>
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