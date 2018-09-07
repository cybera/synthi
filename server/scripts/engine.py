#!/usr/bin/env python

# get neo4j connection
# get ID of dataset to generate
# find transformation
# find transformation inputs
# collect and send to transformation function

import pandas as pd
from importlib.machinery import SourceFileLoader
from neo4j.v1 import GraphDatabase

class DatasetsWrapper:
  def __init__(self, transform_info):
    self.dataset_meta = dict()
    self.dataset_meta[transform_info['name']] = dict()
    self.dataset_meta[transform_info['name']]['path'] = transform_info['path']
  
  def fetch_df(self, name):
    return pd.read_csv(self.dataset_meta[name]['path'])

  def update_df(self, name, df):
    df.to_csv(self.dataset_meta[name]['path'])

neo4j_uri = "bolt://localhost:7687"
neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=('neo4j','password'))
session = neo4j_driver.session()
tx = session.begin_transaction()

query = '''
MATCH (output:Dataset)<-[:OUTPUT]-(transformation:Transformation)<-[:INPUT]-(input:Dataset)
WHERE ID(output) = $id
RETURN output, transformation, input
'''

result = tx.run(query, id=41)
r = result.single()

wrapped_inputs = DatasetsWrapper(r['input'])
wrapped_outputs = DatasetsWrapper(r['output'])


transform = SourceFileLoader("transform", r['transformation']['script']).load_module()

transform.transform(wrapped_inputs, wrapped_outputs)