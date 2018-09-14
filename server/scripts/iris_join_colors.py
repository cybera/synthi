import pandas as pd

iris_virtual = dataset_input("iris-virtual")
iris_colors = dataset_input("iris-colors")

dataset_output("iris-joined")

def transform():
  return pd.merge(iris_virtual, iris_colors, on="species")