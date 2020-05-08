import React from 'react'

import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'

import Paper from '@material-ui/core/Paper'

import DataTableView from './DataTableView'
import DatasetColumnChips from './DatasetColumnChips'
import { datasetProptype } from '../../../lib/adiProptypes'
import PanelLoadingState from '../../layout/PanelLoadingState'

const Preview = ({ dataset }) => {
  const DATASET_SAMPLE_DATA = gql`
    query DatasetSampleData($uuid: String) {
      dataset(uuid: $uuid) {
        uuid
        columns {
          uuid
          originalName
          name
          visible
        }
        samples
      }
    }
  `

  const { uuid } = dataset
  const { loading, error, data } = useQuery(DATASET_SAMPLE_DATA, { variables: { uuid } })

  if (loading) return <PanelLoadingState />
  if (error) return 'Error...'

  const previewableDataset = data.dataset[0]
  const displayColumns = previewableDataset.columns
  const selectedColumns = displayColumns.filter((column) => column.visible)

  const sampleRows = previewableDataset.samples.map((s) => {
    const record = JSON.parse(s)
    return selectedColumns.map((column) => record[column.originalName || column.name])
  })

  return (
    <>
      <Paper>
        <DataTableView columns={selectedColumns} rows={sampleRows} />
      </Paper>
      <DatasetColumnChips dataset={previewableDataset} columns={displayColumns} />
    </>
  )
}

Preview.propTypes = {
  dataset: datasetProptype.isRequired
}

export default Preview
