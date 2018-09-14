iris = dataset_input("iris")
dataset_output("iris-virtual")

def transform():
  return (iris.groupby(['species'])
              .mean()
              .reset_index())