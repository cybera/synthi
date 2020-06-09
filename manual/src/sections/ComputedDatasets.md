# Computed Datasets

A computed dataset is like a regular dataset in almost every way, except instead of uploading data to it, you supply a code block that outputs a dataset.

We refer to these code blocks as "transformations". Transformations can take any number of datasets you have access to as inputs (even other computed datasets), or no data at all (your code block could access an API hosted elsewhere to fetch initial data). The output will be the dataset you create the transformation on.

## Python transformations

Synthi currently enables making a computed dataset through a Python code block. Other languages may be supported in the future. Here's what a transformation looks like on the platform:

![transformation-example](../images/transformation-example.png)

## The simplest transformation you can write

A transformation needs to produce a dataset as the return value of the transformation function. The simplest transformation you can write, simply makes a duplicate of the dataset you have:

```python
@transformation(inputs=dict(df = dataset('iris')))
def iris_duplicate(df):
  return (df)  
```

While this may not very interesting, it's a good way to start, even with more complex transformations. But first, let's look at how this very basic transformation works.

Let's start at the first line:

```python
@transformation(inputs=dict(df = dataset('iris')))
```

This line maps the dataset named `iris` in Synthi to a [Pandas Dataframe](https://pandas.pydata.org/pandas-docs/stable/dsintro.html). It handles figuring out where the original dataset is stored, and properly loads it.

The return value of `iris_duplicate` is expected to also be a [Pandas Dataframe](https://pandas.pydata.org/pandas-docs/stable/dsintro.html). The transformation engine will handle storing this dataset properly for you.

{% hint style='info' %}
It's important to make your `dataset('yourDatasetName')` assignments outside of the transformation function. When saving the transformation, the `dataset('yourDatasetName')` calls are used to correctly establish relationships between datasets, which in turn is used to figure out dependencies when running transformations that depend on other transformations.
{% endhint %}

### Name addressing

Under each organization, dataset names need to be unique from each other. If you have access to more than one organization, you can reference a dataset from the other organization in your transformations. Simply put the organization name first, followed by a colon (`:`) when referencing the dataset. For example:

```python
@transformation(inputs=dict(df = dataset('Organization 1:Your Dataset Name')))
```

Here, the dataset is referenced with `'Your Dataset Name'` under `'Organization 1'`.

You can only create transformations using datasets you have access to through the organizations you belong to. However, anyone belonging to an organization that you create your transformation in can also use that transformation.

For example, consider User A and User B. User A belongs to Organizations 1 and 2, and User B belongs to Organizations 1 and 3. Since both belong to Organization 1, they can both use any dataset, computed or raw, in Organization 1. However, when the User A creates a computed dataset under organization 1 that uses a dataset from Organization 2 as an input (User B has no direct access to datasets under Organization 2). User B will be able to use it, even though it accesses a dataset under Organization 2.

{% hint style='danger' %}
Cases involving computed datasets that use input datasets spanning organizations can get quite complex, and given that this is pre-alpha software, access control in this area is very rudimentary. The most secure mode of operation with multiple organizations is to only operate within the single organization. The next most secure mode is to only have members using datasets where any input datasets belong to organizations that all the users belong to. Any serious use of the software under a multi-organizational scheme should be well tested before use in production, even when only operating within organizations.
{% endhint %}

### Pandas

Before they're given to the transformation function, the raw datasets are read into the [Pandas](https://pandas.pydata.org) dataframes. Pandas is a Python library that provides functionality to manipulate data structures in a fast and efficient manner.

Please refer to the [pandas documentation](http://pandas.pydata.org/pandas-docs/stable/) if you need help with understanding how to do particular data manipulations. Here are a few common manipulations you're likely want to do:

1. Group by a column:

  The following code will return a transformation on `inputdf`, where it is grouped by 'column_a'. If you wanted to group by two columns (say, 'year' and 'month'), you'd just add the other column to the array.

  ```python
  groupdf = inputdf.groupby(['column_a'])
  ```

  Usually, you'll want to do something with your grouped data before returning it. This may be running an aggregating function on numerical columns in the data, or doing a simple count.

  The following code will compute the mean of any numerical column among members of each group:

  ```python
  groupdf.mean().reset_index()
  ```

  And this counts the size of each group (in terms of number of rows):

  ```python
  groupdf.size().reset_index(name='count')
  ```

  Note that you will want to call `reset_index` after these aggregating functions, as otherwise the group values will become the index. In the case of `count`, since it produces a brand new column, you will also want to supply the name of the new column to the `reset_index` call.

2. Join two datasets by one or more columns:

  ```python
  import pandas as pd
  pd.merge(inputdf1, inputdf2, on="column_a")
  ```

  Multiple columns:

  ```python
  import pandas as pd
  pd.merge(inputdf1, inputdf2, on=["column_a", "column_b"])
  ```

3. Filter by a value in one or more columns:

  Greater than:

  ```python
  inputdf[inputdf['column_a'] > 4]
  ```

  Equal to:

  ```python
  inputdf[inputdf['column_a'] == 4]
  ```

  One of a list of values:

  ```python
  inputdf[inputdf['column_a'].isin([4, 6])]
  ```

4. Drop a column:

  ```python
  inputdf.drop(columns=['column_a'])
  ```