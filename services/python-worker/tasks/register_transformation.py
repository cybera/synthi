#!/usr/bin/env python

import sys
import os
import importlib
import pandas as pd
from importlib.machinery import SourceFileLoader
from neo4j.v1 import GraphDatabase
import storage

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import neo4j_driver, load_transform

neo4j_uri = "bolt://neo4j:7687"
neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=('neo4j','password'))
session = neo4j_driver.session()
tx = session.begin_transaction()

transformation_id = int(sys.argv[1])

transformation = tx.run('''
  MATCH (t:Transformation)
  WHERE ID(t) = toInteger($id)
  RETURN t
''', id=transformation_id).single()['t']

inputs = []
outputs = []

def dataset_input(name):
  inputs.append(name)

def dataset_output(name):
  if len(outputs) == 0:
    outputs.append(name)
  else:
    print("Transformations can currently only have one output")
    exit(0)

transform_mod = load_transform(transformation['script'],
                               dataset_input,
                               dataset_output)

input_query = '''
  MATCH (t:Transformation)
  WHERE ID(t) = toInteger($id)
  SET t.inputs = $inputs
  WITH t
  UNWIND t.inputs AS input_name
  WITH t, input_name
  MATCH (input:Dataset { name: input_name })
  MERGE (input)-[:INPUT]->(t)
'''

output_query = '''
  MATCH (t:Transformation)
  WHERE ID(t) = toInteger($id)
  SET t.outputs = $outputs
  WITH t
  UNWIND t.outputs AS output_name
  MERGE (output:Dataset { name: output_name })
  MERGE (output)<-[:OUTPUT]-(t)
  SET 
    output.computed = true, 
    output.path = (output_name + ".csv")
'''

results = tx.run(input_query, id=transformation_id, inputs=inputs)
results = tx.run(output_query, id=transformation_id, outputs=outputs)

tx.commit()