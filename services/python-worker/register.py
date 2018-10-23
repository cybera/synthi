#!/usr/bin/env python

import sys
import os
import importlib
import pandas as pd
from importlib.machinery import SourceFileLoader
from neo4j.v1 import GraphDatabase

# TODO: Make this more configurable. Eventually, we'll want to support object storage
from common import neo4j_driver, SCRIPT_ROOT

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

script_path = os.path.join(SCRIPT_ROOT, transformation['script'])

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

transform_spec = importlib.util.spec_from_file_location("transform", script_path)
transform_mod = importlib.util.module_from_spec(transform_spec)

transform_mod.dataset_input = dataset_input
transform_mod.dataset_output = dataset_output

transform_spec.loader.exec_module(transform_mod)

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