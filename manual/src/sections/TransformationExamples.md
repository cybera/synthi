## Transformation Examples

Computed datasets are created from transformations. Deep down, transformations are just code
that defines how to go from zero or more input datasets to an output dataset (the computed
dataset).

### Requirements for transformations

To be a valid transformation, you need to have a transformation function that takes no parameters
and returns the data you want to represent your computed dataset. This data should either be
a pandas dataframe (for structured data), a string representing text data, or raw bytes.

You can use `dataset(<DATASET_NAME>)` function calls before the transformation function (as
calls in the global space) and map it to the `inputs` parameter to load datasets from ADI to use in your transformations.

### Identity transformation

The simplest possible transformation you could do is one that simply returns the dataset passed
in. In other words, it's a transformation that does absolutely nothing. Here's how you define it:

```python
@transformation(inputs=dict(df = dataset('df')))
def duplicate(df):
  return (df)  
```

### Joining two datasets

```python
import pandas as pd
from adi.dev.transformation import dataset, transformation

@transformation(inputs=dict(df1=dataset("iris-means"),df2=dataset("iris-colors")))
def mergeDatasets(df1,df2):
  return (pd.merge(df1, df2, on="join_column"))
```

In the above example, `"join_column"` is the column name you're joining on. 

### Processing a zip file

```python
from zipfile import ZipFile
from tempfile import mkstemp
from io import BytesIO
import pandas as pd
from adi.dev.transformation import dataset, transformation

# Since this is a zip file, we need to make sure we're retrieving the
# raw bytes.
@transformation(inputs=dict(zipped=dataset("my-zipped-dataset")))
def readZippedDataset(zipped):
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

### Extracting Excel data

If your source data is in the form of spreadsheets made for humans to read easily, you
may have to do a fair bit of work to turn it into good structured data. If the spreadsheet
is very basic 2D data without extra formatting, you may be able to just export a .csv file
that you can directly import to ADI. But often, for presentation purposes, a spreadsheet
will put values in some strange places that don't allow you to just export to .csv.

In the following example, we have an Excel spreadsheet with 40 values stored in 2 columns, where
the field names are beside the values they represent. Each sheet of the spreadsheet (conveniently
named "Sheet 1", "Sheet 2", and so on, up to "Sheet 100") has a copy of this structure, but
represents a different observation.

| Sheet 1  |
|----------|-----|-----------|-----|---|
| Field 1  | 22  | Field 21  | 29  |   |
| Field 2  | 48  | Field 22  | 92  |   |
| Field 3  | 19  | Field 23  | 84  |   |
| ...      | ... | ...       | ... |   |
| Field 20 | 3   | Field 40  | 11  |   |

| Sheet 2  |
|----------|-----|-----------|-----|---|
| Field 1  | 42  | Field 21  | 21  |   |
| Field 2  | 63  | Field 22  | 87  |   |
| Field 3  | 7   | Field 23  | 25  |   |
| ...      | ... | ...       | ... |   |
| Field 20 | 48  | Field 40  | 31  |   |

We want to turn each sheet into a single row of data so that our CSV would look like:

```csv
"Field 1","Field 2","Field 3",...,"Field 20","Field 21","Field 22","Field 23","Field 40"
22,48,19,...,3,29,92,84,...,11
42,63,7,...,48,21,87,25,...,31
...
```

Here is the code you would write to perform this transformation:

```python
from tempfile import mkstemp
import pandas as pd
import os
from adi.dev.transformation import dataset, transformation

@transformation(inputs=dict(xlsx=dataset("xlsx")))
def transformExcelData():
  fd, path = mkstemp()
  with open(path, 'wb') as f:
    f.write(xlsx)
  
  excel_df = pd.read_excel(path, sheet_name=None, header=None)

  records = []
  
  for sheetnum in range(1,100):
    # Start a new record and grab the associated sheet
    record = {}
    sheet = excel_df[f"Sheet {sheetnum}"]

    # First column
    for cell_row in range(1, 20):
      record[sheet.loc[cell_row, 1]] = sheet.loc[cell_row, 2]

    # Second column
    for cell_row in range(1, 20):
      record[sheet.loc[cell_row, 3]] = sheet.loc[cell_row, 4]

    records.append(record)
  
  os.close(fd)
  
  return pd.DataFrame(records)
```
