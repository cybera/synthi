## Stream Transformations

As long as your data isn't too big, you should prefer basic Transformations. They
have enough flexibility to allow you to read/write the data any way you need (via
custom `loaders` and `writers`, and in most cases, all you will need to do is map
your input parameters to ADI datasets.

But what happens if your dataset is too big to fit in memory? You could write a
specialized Transformation class that processes the data in a way that you don't
need to put all of it in memory. We've written a `StreamTransformation` class that
is almost as easy to use as a basic Transformation and should handle many of the
cases where you want to process and write larger datasets as you read them.

### Requirements

To use our `StreamTransformation` you'll need to make sure your transformation follows
a couple of basic rules:

1. When loading parameters for your transformation, one (and only one) parameter should be a 
generator/iterator representing your streamed dataset. In other words, `StreamTransformation`
only truly streams a single dataset, even though your transformation can still use multiple
datasets.

2. Your transformation can't depend on knowing the entire dataset. This one is fairly obvious.
If you only load part of a dataset at a time and write that part out immediately, any operations
will only apply to that chunk.

### Why do we only allow one dataset to be streamed?

Think about what would happen if we streamed two datasets at once, where one was twice the
size of the other. Would we want to load the same amount of rows from each for every call
to our transformation function? What happens once we run out of new rows in the smaller
dataset? Do we stop? Do we loop back around? Do we keep going on the larger dataset and
return nothing from the exhausted one?

It's really hard to guess how you might want to load and process two large datasets at once.
If you absolutely have to do this, you'll probably have to write a very custom transformation,
where you consider the entire loading/processing/writing chain all at once. You can still
do this by extending our `Transformation` class and defining your own `run` method.

However, in the cases where have a single large dataset that you want to transform, and you
either need no other datasets or you're loading smaller datasets you'll be using to augment
the larger dataset, `StreamTransformation` will do a lot of the dirty work. During each
call to your transformation function, you'll get a chunk of your streamed dataset and full
datasets for all your other datasets.

### Writing a StreamTransformation

Here is a working `StreamTransformation` of the iris dataset:

```python
from adi.dev.transformation import dataset, transformation
from adi.dev.stream_transformation import StreamTransformation, create_stream_loader

@transformation(
  StreamTransformation,
  inputs=dict(df = dataset('iris')),
  loader=dict(df = create_stream_loader(20))
)
def iris_means(df):
  return (df.groupby(['species'])
            .mean()
            .reset_index())
```

Note that the `iris_means` function is exactly the same as the one you'd write for a 
non-streaming transformation. The difference is what you pass in to the `@transformation`
decorator. It needs at least two other pieces of information:

1. Since we're no longer using the basic default `Transformation` class, you need to tell
it to use the `StreamTransformation` class in the first parameter.

2. You **must** provide a single `loader` for one of your datasets that returns a generator/iterator.
This needs to be written in a way that it doesn't need to load the entire dataset. If you can load
the entire dataset, just use a basic `Transformation`. For convenience, we've added a `create_stream_loader`
function that, given a chunk size, will create a loader much like our basic default loaders that knows
how to grab data stored in ADI in chunks of that size.

In the above example, we'll be reading the iris dataset 20 rows at a time.

### Gotchas

If you run the above transformation, the results may seem a bit odd. Even though you're grouping
by *species*, you'll see more than one row per species with different averages. The smaller you
make the chunk size for the stream loader, the more rows you'll end up with. What gives?

Remember that with a `StreamTransformation`, you're reading a chunk of data, running your
transformation function on it, then writing it out. So for each chunk, you're only going to
get a maximum of one row per *species* in the above example. But then the next chunk will be 
read, processed, and written independently.

In the above example, you could still get your intended result by creating *another* regular
`Transformation` that runs on the results of your `StreamTransformation`. But note that the
only reason you can do this is that the **mean** operation isn't affected by being run in
this way. If you were to do another averaging function like **median** that needs to know
all of the values in the dataset to find the middle one, you would most likely get a different
answer after running it again on the `StreamTransformation` results than you would have if
you had run it over the entire dataset once.

The safest streaming transformations to run will be ones that are aimed at processing single
rows rather than grouping and summarizing them. The next safest will be those where running
multiple grouping operations to gradually reduce the size of a dataset would be the same as
if you were able to load the entire dataset. Operations like `mean` and `count` `min` or `max`
summaries would fall into this category.

If you still need to run an unsafe grouping operation in this way, you may be able to take
other steps to minimize the error introduced. For example:

1. Increase the chunk size as much as possible.
2. Create intermediate transformations that stratify your data and take random samples from
those groups, then combine the random samples back into a dataset that you can process normally.