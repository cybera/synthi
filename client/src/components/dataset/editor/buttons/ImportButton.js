import React from 'react'

import gql from 'graphql-tag'

import { useMutation } from 'react-apollo'

import SynthiButton from '../../../layout/buttons/SynthiButton'
import { datasetProptype } from '../../../../lib/synthiProptypes'

const IMPORT_MUTATION = gql`
  mutation ImportDataset($uuid: String!) {
    importCSV(uuid: $uuid) {
      uuid
      samples
      importTask: lastTask(types: ["import_csv", "import_document"]) {
        uuid
        state
        message
        type
      }
    }
  }
`

export default function ImportButton({ dataset }) {
  const [importDataset] = useMutation(IMPORT_MUTATION, { variables: { uuid: dataset.uuid } })
  return (
    <SynthiButton onClick={importDataset}>
      { dataset.importTask ? 'Reimport' : 'Import' }
    </SynthiButton>
  )
}

ImportButton.propTypes = {
  dataset: datasetProptype.isRequired
}
