#!/usr/bin/env python

def transform(inputs, outputs):
  # Checks that the "iris" label actually has something connected to it
  # Gets the information from Neo4J about the dataset (where it is physically, what format)
  # Loads it into a pandas dataframe and returns it
  # May end up adding other types of access in the future that allow a direct query on
  # a data source that returns a reduced dataframe (i.e. massive data in BigQuery) or
  # simple moving of data from one place to another.
  iris = inputs.fetch_df("iris")
  
  # do some aggregation of the iris dataset
  iris_groups = (iris.groupby(['species'])
                     .mean()
                     .reset_index())
                 

  outputs.update_df("iris-virtual", iris_groups)
