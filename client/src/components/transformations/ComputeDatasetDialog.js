import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormHelperText from '@material-ui/core/FormHelperText'

import gql from 'graphql-tag'
import { useQuery, useMutation, useLazyQuery } from 'react-apollo'

import { debounce, pick } from 'lodash'

import { AutocompleteInput } from '../layout/form-fields/AutocompleteInput'
import ADIButton from '../layout/buttons/ADIButton'
import NavigationContext from '../../contexts/NavigationContext'
import { transformationProptype, transformationInputMappingProptype } from '../../lib/adiProptypes'
import { openSnackbar } from '../layout/Notifier'

const DATASET_LIST = gql`
  query DatasetList($org: OrganizationRef!, $filter: DatasetFilter) {
    listDatasets(org: $org, filter: $filter, limit: 20) {
      datasets {
        name
        uuid
      }
    }
  }
`

const DatasetInput = ({ alias, onChange, value }) => {
  const navigation = useContext(NavigationContext)
  const [filterText, setFilterText] = useState('')
  const [debouncing, setDebouncing] = useState(false)
  const setFilterTextDebounced = debounce((textValue) => {
    setFilterText(textValue)
    setDebouncing(false)
  }, 1000)
  const handleFilterTextChange = (event) => {
    const { value: textValue } = event.target
    setFilterTextDebounced(textValue)
    setDebouncing(true)
  }

  const { data, loading, error } = useQuery(DATASET_LIST, {
    variables: {
      org: {
        uuid: navigation.currentOrg
      },
      filter: {
        searchString: filterText ? `Dataset.name:/${filterText}.*/` : undefined
      }
    }
  })

  const options = loading || error ? [] : data.listDatasets.datasets

  return (
    <AutocompleteInput
      options={options}
      getOptionLabel={(option) => option.name}
      loading={debouncing || loading || error}
      label={alias}
      onChange={onChange}
      onTextChange={handleFilterTextChange}
      value={value}
    />
  )
}

const CREATE_COMPUTED_DATASET = gql`
  mutation CreateComputedDatasetFromTransformation(
    $params: ComputedDatasetFromTransformationParams,
    $owner: OrganizationRef
  ) {
    createComputedDatasetFromTransformation(params: $params, owner: $owner) {
      dataset {
        name
        uuid
      }
      error
    }
  }
`

const UNIQUE_DATASET_NAME_QUERY = gql`
  query UniqueDatasetName($org: OrganizationRef!) {
    uniqueDefaultDatasetName(org: $org)
  }
`

export default function ComputeDatasetDialog({ transformation, buttonClass }) {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState({
    name: '',
    inputs: transformation.inputs.map((input) => ({ alias: input, dataset: null })),
    template: { uuid: transformation.uuid }
  });
  const [error, setError] = useState(null)
  const navigation = useContext(NavigationContext)
  const [fetchUniqueDatasetName] = useLazyQuery(UNIQUE_DATASET_NAME_QUERY, {
    variables: { org: { uuid: navigation.currentOrg } },
    onCompleted: (data) => {
      setParams({ ...params, name: data.uniqueDefaultDatasetName })
    },
    fetchPolicy: 'network-only'
  })


  const handleClickOpen = () => {
    fetchUniqueDatasetName()
    setError(null)
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false)
  };

  const handleInputChange = (alias) => (event, value) => {
    const temp = { ...params }
    const newInput = { alias, dataset: pick(value, ['uuid', 'name']) }
    const index = temp.inputs.findIndex((input) => input.alias === alias)
    temp.inputs[index] = newInput
    setParams(temp)
  }

  const handleNameChange = (event) => {
    setParams({
      ...params,
      name: event.target.value
    })
  }

  const [createComputedDatasetFromTransformation] = useMutation(CREATE_COMPUTED_DATASET, {
    variables: {
      owner: { uuid: navigation.currentOrg }
    }
  })

  const handleConfirm = async () => {
    if (!params.name) {
      setError('Please enter a name for your dataset')
      return
    }

    const mutationResult = await createComputedDatasetFromTransformation({ variables: { params } })
    const result = mutationResult.data.createComputedDatasetFromTransformation

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      const handleWorkbenchNav = () => {
        navigation.switchMode('datasets')
        navigation.selectDataset(result.dataset.uuid)
      }

      const action = (
        <Button color="primary" size="small" onClick={handleWorkbenchNav}>
          View in Workbench
        </Button>
      )

      openSnackbar({ message: `'${result.dataset.name}' created!`, action, variant: 'success' })
    }
  }

  return (
    <div>
      <ADIButton size="small" onClick={handleClickOpen} className={buttonClass}>
        Compute Dataset
      </ADIButton>
      <Dialog open={open} onClose={handleCancel} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create Computed Dataset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a name and inputs for your Dataset.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            value={params.name}
            fullWidth
            onChange={handleNameChange}
          />
          { params.inputs.map(({ alias, dataset }) => (
            <DatasetInput
              key={alias}
              alias={alias}
              value={dataset}
              onChange={handleInputChange(alias)}
            />
          ))}
          { error && (
            <FormHelperText error>
              { error }
            </FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

ComputeDatasetDialog.propTypes = {
  transformation: transformationProptype.isRequired,
  buttonClass: PropTypes.string,
}

ComputeDatasetDialog.defaultProps = {
  buttonClass: undefined,
}

DatasetInput.propTypes = {
  alias: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: transformationInputMappingProptype,
}

DatasetInput.defaultProps = {
  value: null
}
