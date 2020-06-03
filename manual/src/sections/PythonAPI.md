## Using the python-synthi package

### Installation

Git clone the [python-synthi](https://github.com/cybera/python-synthi.git) repository. 

```bash
pip install -e python-synthi
```

from the same environment that you'll be running Jupyter Lab. You can also run the following
from a notebook cell to ensure the pip package is installed in the right environment:

```bash
!pip install -e python-synthi
```

In either case, you'll need to restart any running Jupyter kernels to be able to access
the package.

### Creating a connection

To create a client connection, you'll need your API token (read more about API tokens
[here](ExportingAndImporting.md#api-exports)) and the URL of the Synthi server.

Here's an example code block:

```python
from synthi import Connection

client = Connection(
  'https://<synthi-host-url>',
  api_key='???????????????????????????'
)
```

### Overview

The client connection object that you create above will have 3 main namespaces for function
calls:

- organization
- dataset
- transformation

These correspond to equivalent areas of the application. For example, `client.dataset.define`
will define a computed dataset, which uses transformation code that only relates to that
dataset. `client.transformation.define` will allow you to create a transformatin that can
be applied later to any compatible dataset.

### Setting an organization

You can belong to multiple organizations. When using the Python API, you need to set the
organization you want API requests to apply to:

```python
client.organization.set_default('myorg')
```

### Uploading and downloading datasets

The following code will upload a local file at *./path/to/your/dataset.csv* to Synthi. It will
be named *My New Dataset* in the interface. Just as using the interface to create a dataset,
the name has to be unique within your organization.

```python
client.dataset.upload('My New Dataset', './path/to/your/dataset.csv')
```

The following code will retrieve the dataset you just stored in Synthi and return it as a Pandas
dataframe.

```python
df = client.dataset.get('My New Dataset')
```

#### Working with non-structured data

If you want to retrieve a dataset without automatically converting it to a Pandas dataframe,
you can pass in `raw=True` as a parameter:

```python
mytext = client.dataset.get('My New Dataset', raw=True)
```

By default, this will attempt to retreive the data as text. If you are dealing with binary
data or a text encoding other than utf-8, you will likely need to go one step further:

```python
mydata = client.dataset.get('My New Dataset', raw=True, as_text=False)
```

This will give you the data as raw bytes and leave it up to you to convert it into what you
need.

{% hint style="danger" %}
In all cases, we load the data fully into memory. We will be allowing more flexibility
in a future release, but for now, memory available will be a limiting factor to the size of
datasets that can be processed in a transformation.
{% endhint %}

{% hint style="info" %}
When fetching datasets, we default to returning the 'imported' version of the dataset for
structured (CSV) and unstructured document datasets. For structured data, this imported
version will be a normalized version of the data (one example: CSV data that was originally
uploaded without a header will be given default column names in the 'imported' version).
When dealing with document datasets, the imported version is the raw text extracted from 
them. In both cases, we're assuming this is likely the most basic starting point for further
transforming the data. The 3rd dataset type 'other' only has an 'original' version and that's
what will be downloaded by default.

If there are file encoding or other issues where our defaults are not appropriate, you may
want to explicitly get the original version of the data that was uploaded. You can do this
with another named parameter:

```python
myoriginal = client.dataset.get('My New Dataset', format='original')
```

<!---
TODO: Format here is really confusing. We use 'type' internally on the server when referring
to the type of dataset, and we use 'format' to refer to a specific instance, like PDF or DOCX.
We'll want to nail some of this down before long.
-->
{% endhint %}

### Defining datasets

Datasets are either uploaded or defined through a code transformation. To define a dataset,
you need to supply a unique name for the dataset and some code that will create that dataset.
This code can reference other datasets that you have access to.

```python
client.dataset.define('My Computed Dataset', '/path/to/transformation.py')
```

This is very similar to uploading a dataset, except instead of a path to raw data, you
provide a path to a file containing code.

The primary requirement for the code you supply is that it contains a `transform` function.
You can run any Python code and import any libraries that we have pre-installed.

Here's an example of a very simple transformation:

```python
df = dataset_input('My New Dataset')

def transform():
  return df.head(10)
```

This transformation will retrieve the *'My New Dataset'* dataset and create a new dataset
based off of it containing only the first 10 rows.

{% hint style="info" %}
We're using the `continuumio/anaconda3` Docker image as the basis of the container that runs
your transformations. This includes many popular packages, such as pandas, numpy and matplotlib.
While you can't yet use packages we haven't installed, please let us know if we don't have a
package you need. In a future update, we plan to open this up to allow you to specify your
own Docker images.

<!--
TODO: Insert an operations email here to receive requests.
-->
{% endhint %}

### Other dataset operations

Here are some other commands you can run for datasets.

List the datasets in your organization:

```python
client.dataset.list()
```

Generate a computed dataset (this will generate any computed datasets it depends on as well):

```python
client.dataset.generate('My Computed Dataset')
```

Get basic metadata information about the dataset (right now, just name and uuid):

```python
client.dataset.meta('My Dataset')
```

Create a dataset without uploading to it:

```python
client.dataset.create('My Dataset')
```

Delete a dataset:

```python
client.dataset.delete('My Dataset')
```

### Defining transformations

If you want to define a transformation that can be used to define a dataset without explicitly
writing new code, you call a similar `define` function in the transformation namespace:

```python
client.transformation.define('My Transformation', '/path/to/reusable.py', inputs=['input1'])
```

There is very little difference on the surface between a reusable and non-reusable transformation.
Here, you provide an extra parameter, `inputs`. This is going to be an array of strings representing
how you will internally refer to any datasets within your transformation. Within the transformation,
you reference those inputs as if they were real datasets. For example:

```python
input1 = dataset_input('input1')

def transformation():
  return input1.head(10)
```

### Using defined transformations

To use a defined transformation, you use the same function that you used to define a computed
dataset (after all, you're still making a computed dataset). The difference is, instead of providing
a path to some local code, you provide the name of a transformation you've defined, through the
`template` parameter, and you also supply a mapping of input aliases (the same strings supplied
above when defining the transformation) to their real dataset names:

```python
client.dataset.define(
  'My Computed Dataset',
  template='My Transformation',
  inputs={ 'input1': 'My Dataset' }
)
```

### Other transformation operations

Just as with datasets, you can do some other basic operations that are specific to reusable
transformations.

List the transformations in your organization:

```python
client.transformation.list()
```

Get basic metadata information about the transformation (right now, just name and uuid):

```python
client.transformation.meta('My Transformation')
```

Delete a transformation:

```python
client.transformation.delete('My Transformation')
```

### Running arbitrary API commands

Anything you can do when logged into the website, you can trigger through an API
call. However, we haven't directly included all possible commands in the Python
API. If you want to run an operation programmatically that we have not included,
there's a function you can use to send the direct GraphQL query (called `query`).
For example, if you wanted to publish a transformation you have access to, you 
could run:

```python
publish_query = '''
mutation PublishTransformation($uuid: String!, $published: Boolean) {
  publishTransformation(uuid: $uuid, published: $published) {
    uuid
    name
    published
  }
}
'''

uuid='your-transformation-uuid'

client.query(publish_query, dict(uuid=uuid, published=True))
```

We hope you don't have much use for this, and you should let us know if there's
functionality that you'd like us to add to the Python API. But in the meantime,
this will allow you to drive Synthi externally in ways we haven't thought of.
