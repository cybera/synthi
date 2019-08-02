iris = dataset_input("iris")

def transform():
  return (iris
          .groupby("species")
          .mean()
          .reset_index())
