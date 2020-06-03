## Creating a Custom Transformation Class

What happens if you have a problem that is just too big or complex to describe
using our basic `@transformation` decorator and various `loader` and `writer`
overrides?

It may end up being simpler to just do everything yourself.

### What is a Transformation again?

All Synthi requires in your transformation code is something that extends Transformation
with a `run` method that takes a single variable which represents a map of parameters:

```python
from synthi.dev.transformation import Transformation

class CustomTransformation(Transformation):
  def run(self, params):
    pass
```

The above transformation would do absolutely nothing, but it would run. The key to
using this is in understanding what gets passed into `params` from Synthi. The basic
structure is as follows:

```json
{
  "input": {
    "input1": {
      ...datamap...
    },
    "input2": {
      ...datamap...
    }
  },
  "output": {
    ...datamap...
  }
}
```

See the [Transformations](./Transformations.md) section for more information on what each
'datamap' contains. You'll need to decide yourself on the right temporary urls to read from
and the right ones to write to. You also may want to manage your own metadata collection:

```python
self.metadata['columns'] = { ... }
self.metadata['type'] = '...'
self.metadata['bytes'] = 123
```

However, if you leave the metadata alone, we will still collect those values for you. For `'bytes'`,
you would need to have written to the `'imported'` path of your output datamap.

### Helper functions

Much of the basics of reading from and writing to storage already have helper functions that you
may want to use in `synthi.dev.storage`. You may also want to look at how we created `StreamTransformation`
to see an example of creating a brand new `Transformation` class. Keep in mind that these are early
stages in this library, and these helper functions may still shift around a bit.