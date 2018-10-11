# Example:
#
# Take the "iris" dataset, group by the species of flower, and
# compute the means of all other values.

# The dataset_input function fetches a named dataset from ADI into a
# pandas dataframe. Declaring your input in this way also helps ADI
# manage re-running this transformation and chaining it to others.
iris = dataset_input("iris")

# You can have as many functions as you want, but this function is
# the only required function. It should return a pandas dataframe
# in the form you want it saved. The transformation engine will
# handle converting it to a physical format (right now CSV) and
# storing the actual file.
def transform():
  return (iris.groupby(['species'])
              .mean()
              .reset_index())