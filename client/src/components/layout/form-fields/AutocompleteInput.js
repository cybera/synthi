/* eslint-disable no-use-before-define */
import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

const AutocompleteInput = ({ onChange, options, value, loading, onTextChange, label, ...rest }) => {
  return (
    <Autocomplete
      options={options}
      value={value}
      filterSelectedOptions
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...params}
          variant="outlined"
          label={label}
          margin="normal"
          fullWidth
          onChange={onTextChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  );
}

const AutocompleteChipInput = ({ onChange, options, value, loading, onTextChange, label }) => {
  return (
    <AutocompleteInput
      multiple
      onChange={onChange}
      options={options}
      value={value}
      loading={loading}
      label={label}
      onTextChange={onTextChange}
    />
  )
}

export {
  AutocompleteInput,
  AutocompleteChipInput,
}