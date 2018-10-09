import React from 'react'
import ADIButton from '../components/ADIButton'
import DatasetGenerator from '../components/DatasetGenerator'
import ToggleVisibility from '../components/ToggleVisibility'
import DatasetUploadButton from './DatasetUploadButton'

const DatasetEditor = (props) => {
  const { dataset } = props
  return (
    <div>
      <ToggleVisibility visible={!dataset.computed}>
        <DatasetUploadButton dataset={dataset}/>
      </ToggleVisibility>
      <DatasetGenerator>
        {({generateDataset}) => {
          return dataset.computed && <ADIButton disabled={dataset.generating} onClick={e => generateDataset(dataset.id)}>Generate!</ADIButton>
        }}
      </DatasetGenerator>
    </div>
  )
}

export default DatasetEditor