## New Transformation API

{% hint style="danger" %}
Most of this doesn't yet exist. We're writing the user manual first!
{% endhint %}

### What is a Transformation?

When you think about it, every step a data scientist takes between grabbing a dataset and showing
a great visualization based on it or discovering some insight or creating a machine learning model
is simply creating another, more focused dataset. We start with raw data and we continually refine
it until it is ready to stick into a chart or use to train a machine learning model.

We have far too much data in most datasets to do this sort of thing by hand. So we write code to
programatically refine the data. ADI encourages you to think of that code as discrete steps or
transformations. And every transformation is really just a way of defining a new dataset with
code and some raw inputs.

### Defining a Transformation

Here's how you define a very basic transformation:

```python
from adi.transform import transformation

@transformation(name='Species Means')
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
@transformation(name='Species Means')
```

It attaches a whole bunch of default code around the `species_means` function that handles the loading
and storing aspects.

#### Loaders and Writers

Every variable that you pass into your function gets a *loader* associated with it. And the return value
of your function gets a *writer* associated with it. There is also a *default loader* that will be used
for any variable that doesn't have a specific loader defined for it. A *loader* is just a regular function
with a single parameter representing a map of expected values that ADI will provide when the transformation
is run. These values are:

- **storage**: a string respresenting the way in which the data is stored. Right now the only value this
will be is `'swift-tempurl'`, so any custom loader functions should at least consider this, but we may add
more in the future.
- **value**: a representation of the data itself. This will only make sense in the context of a particular
`'storage'` value. Whenever `'storage'` is `'swift-tempurl'`, the `'value'` will be a string representing
a secure tempurl to a location on ADI's object storage where the dataset can be read using a simple `GET`
request from any http client.
- **format**: 