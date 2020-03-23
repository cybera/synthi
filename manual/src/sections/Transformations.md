## Transformation API

### What is a Transformation?

Every step a data scientist takes between grabbing a dataset and showing a great visualization
based on it or discovering some insight or creating a machine learning model is simply creating
another, more focused dataset. We start with raw data and we continually refine it until it is 
ready to stick into a chart or use to train a machine learning model.

We have far too much data in most datasets to do this sort of thing by hand. So we write code to
programatically refine the data. ADI encourages you to think of that code as discrete steps or
transformations. And every transformation is really just a way of defining a new dataset with
code and some raw inputs.

### Defining a Transformation

Here's how you define a very basic transformation:

```python
from adi.dev.transformation import transformation

@transformation
def species_means(df):
  return df.groupby('species').mean()
```

This is doing a lot, but let's start with the most basic part of it:

```python
def species_means(df):
  return df.groupy('species').mean()
```

`species_means` is just a regular Python function. In this particular function, we *are* however assuming
some things about `df`. In particular, we're assuming it's a **Pandas** dataframe, which we can call methods like `groupby` and `mean` on. This makes it quite easy to compute means for any existing dataframe with a
*species* column. For example:

```python
iris = pd.read_csv('iris.csv')
iris_species = species_means(iris)
```

will produce a transformed dataset (`iris_species`) with only three rows of data representing each species,
along with a column containing the computed mean for every numerical column/species combination.

Running `species_means` this way requires you to first prepare your input variable by loading up a
Pandas data frame from a raw dataset. This is great when doing exploratory work in a notebook because
you often already have the dataset loaded up that you want to run a function on. You also usually want
to work directly with whatever the output of your function is, so you don't need to put any thougt into
where to put it.

When we push this code up to a transformation pipeline in ADI, it also needs to figure out how to
get the data from where it's being stored into the format your function is expecting. How does it
do this? And what about that return value? How does ADI know what to do with the results?

This is where the following decorator comes in:

```python
@transformation
```

It attaches a whole bunch of default code around the `species_means` function that handles the loading
and storing aspects. In many cases, especially when your transformation can be done completely in memory,
this will be all you need to do, and you can just focus on writing the logic of the transformation.

To create a computed dataset directly, you need to also indicate the mappings of datasets to parameters
when defining the transformation:

```python
from adi.dev.transformation import dataset, transformation

@transformation(inputs=dict(df = dataset('iris')))
def iris_means(df):
  return (df.groupby(['species'])
            .mean())
```

The above code maps the dataset named 'iris' in ADI to the `df` parameter. The `dataset` function used
will also accept an `org` and a `variant`. By default the `org` will not be defined (and ADI will look
for a dataset under the same organization as the defined transformation) and `variant` will be `'imported'`.

#### Loaders and Writers

If you need to load or write data in a way that's not supported by default, you have a number of options. 
The first of those options is defining your own *loaders* and/or *writer*.

Every variable that you pass into your function gets a *loader* associated with it. And the return value
of your function gets a *writer* associated with it. There is also a *default loader* that will be used
for any variable that doesn't have a specific loader defined for it. A *loader* is just a regular function
with the following signature:

```python
def my_custom_loader(datamap, variant='imported')
```

The writer has one extra parameter representing the data that needs to be written:

```python
def my_custom_writer(data, datamap, variant='imported')
```

Here are some very minimalistic readers and writers that would handle csv data coming
from the local filesystem:

```python
def my_custom_loader(datamap, variant='imported'):
  if datamap['storage'] == 'local' and datamap['format'] == 'csv':
    return pd.read_csv(datamap['value'][variant])
  else:
    raise Exception("Not supported")
```

```python
def my_custom_writer(data, datamap, variant='imported'):
  if datamap['storage'] == 'local' and type(data) is pd.DataFrame::
    data.to_csv(datamap['value'][variant])
  else:
    raise Exception("Not supported")  
```

It does not return anything. It's expected to write directly to one of the storage
locations given in the `datamap`.

When writing either a loader or a writer, you should use the `variant` passed in to
ultimately decide the storage location to use, allowing ADI to pick the right one.
Thus a call to get the actual storage location should look like this:

```python
datamap['value'][variant]
```

The entire datamap will look like this:

```json
{
  "value": {
    "original": "https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_<your_account_id>/adi-datasets/<your-dataset.original.csv>?temp_url_sig=<random-string>",
    "imported": "https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_<your_account_id>/adi-datasets/<your-dataset.imported.csv>?temp_url_sig=<random-string>",
    "sample": "https://swift-yeg.cloud.cybera.ca:8080/v1/AUTH_<your_account_id>/adi-datasets/<your-dataset.sample.csv>?temp_url_sig=<random-string>"
  },
  "storage": "swift-tempurl",
  "format": "csv"
}
```

- **value**: a representation of the data itself. This will only make sense in the context of a particular
`'storage'` value. Whenever `'storage'` is `'swift-tempurl'`, the `'value'` will be a string representing
a secure tempurl to a location on ADI's object storage where the dataset can be read using a simple `GET`
request from any http client (when it is an input dataset) or a simple `PUT` request (when it is an output
dataset).
- **storage**: a string respresenting the way in which the data is stored. Right now the only value this
will be is `'swift-tempurl'`, so any custom loader functions should at least consider this, but we may add
more in the future.
- **format**: what kind of data the transformation can expect to receive (for example: 'csv' or 'pdf'). This
allows more general purpose loaders to be written that handle a variety of formats, though for very unique
cases, there is always the option to create a single-parameter loader. Single-parameter loaders don't need
to use the parameter map at all if they don't need it, but it is recommended to use as much as possible, as
this will make even single-purpose loading more adaptable.