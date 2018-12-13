import React from 'react'
import PropTypes from 'prop-types'

import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { datasetListQuery, datasetViewQuery } from '../queries'
import { openSnackbar } from '../components/Notifier'
import EditableTextField from '../components/EditableTextField'

const updateDatasetGQL = gql`
  mutation UpdateDataset($id: Int!, $name: String) {
    updateDataset(id: $id, name: $name) {
      id
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
          variables: { id: dataset.id }
        },
        {
          query: datasetListQuery,
          variables: { org: { id: dataset.owner.id } }
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
              updateMutation({ variables: { id: dataset.id, name: newName } })
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
    id: PropTypes.number
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
