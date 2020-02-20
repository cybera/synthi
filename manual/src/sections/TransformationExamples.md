## Transformation Examples

Computed datasets are created from transformations. Deep down, transformations are just code
that defines how to go from zero or more input datasets to an output dataset (the computed
dataset).

### Requirements for transformations

To be a valid transformation, you need to have a `transform` function that takes no parameters
and returns the data you want to represent your computed dataset. This data should either be
a pandas dataframe (for structured data), a string representing text data, or raw bytes.

You can use `dataset_input(<DATASET_NAME>)` function calls before the `transform` function (as
calls in the global space) to load datasets from ADI to use in your transformations.

### Identity transformation

The simplest possible transformation you could do is one that simply returns the dataset passed
in. In other words, it's a transformation that does absolutely nothing. Here's how you define it:

```python
df = dataset_input('df')

def transform():
  return df
```

### Joining two datasets

```python
import pandas as pd

df1 = dataset_input('df1')
df2 = dataset_input('df2')

def transform():
  return pd.merge(iris_virtual, iris_colors, on="join_column")
```

{% hint style='warning' %}
In the above example, `"join_column"` is the column name you're joining on. Writing a
transformation this way, even if it's a reusable transformation, hardcodes the name of
the column being joined on into the transformation. We're looking at adding the ability
to give parameters to transformations in the future. Right now, the only way to avoid
having to hardcode a column name like this would be to create a new small dataset that
actually contains your parameters. Example:

```python
import pandas as pd

param_df = dataset_input('param_df')
df1 = dataset_input('df1')
df2 = dataset_input('df2')

def transform():
  join_column_name = param_df['join_column'][0]
  return pd.merge(iris_virtual, iris_colors, on=join_column_name)
```

{% endhint %}

### Processing a zip file

```python
from zipfile import ZipFile
from tempfile import mkstemp
from io import BytesIO
import pandas as pd

# Since this is a zip file, we need to make sure we're retrieving the
# raw bytes.
zipped = dataset_input('my-zipped-dataset', raw=True, original=True)

def transform():
  fd, path = mkstemp()

  # We write the zipped data to a local path first to make it eaiser to
  # deal with.
  with open(path, 'wb') as f:
    f.write(zipped)
  
  input_zip = ZipFile(path)
  # Get the file paths from the zip file, excluding some junk that the OS can put in
  part_names = [name for name in input_zip.namelist() if not name.startswith('__')]
  parts = [input_zip.read(name) for name in part_names]

  # Convert each file into a Pandas dataframe
  dfs = [pd.read_csv(BytesIO(part)) for part in parts]
  
  # Concatenate all the different dataframes. This assumes they all have the same
  # columns.
  return pd.concat(dfs)
```
