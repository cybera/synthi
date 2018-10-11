# Example:
#
# Take the "iris-means" and "iris-colors" datasets and join them
# on the "species" column. Note that, in these examples, "iris-means"
# is likely a computed dataset, but it doesn't have to be. These
# transformations don't care whether an input is computed or not,
# and the transformation engine will figure out what transformations
# need to be run for this one to have the data it needs.

import pandas as pd

# The dataset_input function fetches a named dataset from ADI into a
# pandas dataframe. Declaring your input in this way also helps ADI
# manage re-running this transformation and chaining it to others.
iris_virtual = dataset_input("iris-means")
iris_colors = dataset_input("iris-colors")

# You can have as many functions as you want, but this function is
# the only required function. It should return a pandas dataframe
# in the form you want it saved. The transformation engine will
# handle converting it to a physical format (right now CSV) and
# storing the actual file.
def transform():
  return pd.merge(iris_virtual, iris_colors, on="species")