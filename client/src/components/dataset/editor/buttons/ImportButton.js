import React from 'react'

import gql from 'graphql-tag'

import { useMutation } from 'react-apollo'

import ADIButton from '../../../layout/buttons/ADIButton'
import { datasetProptype } from '../../../../lib/adiProptypes'

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
    <ADIButton onClick={importDataset}>
      { dataset.importTask ? 'Reimport' : 'Import' }
    </ADIButton>
  )
}

ImportButton.propTypes = {
  dataset: datasetProptype.isRequired
}
