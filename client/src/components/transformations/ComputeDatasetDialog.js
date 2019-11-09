import React, { useContext, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'

import { debounce } from 'lodash'

import { AutocompleteInput } from '../layout/form-fields/AutocompleteInput'
import ADIButton from '../layout/buttons/ADIButton'
import NavigationContext from '../../contexts/NavigationContext'

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

export default function ComputeDatasetDialog({ transformation }) {
  const [open, setOpen] = React.useState(false);
  const [params, setParams] = React.useState({
    name: 'Computed Dataset',
    inputs: transformation.inputs.map(input => ({ alias: input, dataset: null }))
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (alias) => (event, value) => {
    const temp = { ...params }
    const newInput = { alias, dataset: value }
    const index = temp.inputs.findIndex((input) => input.alias === alias)
    temp.inputs[index] = newInput
    setParams(temp)
  }

  return (
    <div>
      <ADIButton size="small" onClick={handleClickOpen}>
        Compute Dataset
      </ADIButton>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
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
          />
          { params.inputs.map(({ alias, dataset }) => (
            <DatasetInput
              key={alias}
              alias={alias}
              value={dataset}
              onChange={handleInputChange(alias)}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
