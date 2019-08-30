import React from 'react'
import PropTypes from 'prop-types'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetListQuery, datasetViewQuery } from '../queries'
import { openSnackbar } from '../components/Notifier'
import EditableTextField from '../components/EditableTextField'

const updateDatasetGQL = gql`
  mutation UpdateDataset($uuid: String!, $name: String) {
    updateDataset(uuid: $uuid, name: $name) {
      uuid
      name
    }
  }
`

const DatasetNameEditor = (props) => {
  const {
    dataset,
    variant,
    editing,
    changeMode
  } = props

  return (
    <Mutation
      mutation={updateDatasetGQL}
      refetchQueries={[
        {
          query: datasetViewQuery,
          variables: { uuid: dataset.uuid }
        },
        {
          query: datasetListQuery,
          variables: { org: { uuid: dataset.owner.uuid } }
        }
      ]}
    >
      { updateMutation => (
        <EditableTextField
          text={dataset.name}
          variant={variant}
          editing={editing}
          changeMode={changeMode}
          commit={(newName) => {
            const oldName = dataset.name

            if (oldName !== newName) {
              updateMutation({ variables: { uuid: dataset.uuid, name: newName } })
                .then(() => openSnackbar({ message: `Renamed '${oldName}' to '${newName}'` }))
                .catch(e => openSnackbar({ message: e.message }))
            }

            changeMode(false)
          }}
        />
      )}
    </Mutation>
  )
}

DatasetNameEditor.propTypes = {
  dataset: PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string
  }),
  variant: PropTypes.string,
  editing: PropTypes.bool,
  changeMode: PropTypes.func.isRequired
}

DatasetNameEditor.defaultProps = {
  dataset: null,
  variant: 'subtitle1',
  editing: false
}

export default DatasetNameEditor
