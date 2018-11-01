#!/usr/bin/env python

import sys
import os
import importlib
import pandas as pd
from importlib.machinery import SourceFileLoader
from neo4j.v1 import GraphDatabase

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

import storage
from common import neo4j_driver, load_transform

neo4j_uri = "bolt://neo4j:7687"
neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=('neo4j','password'))
session = neo4j_driver.session()
tx = session.begin_transaction()

transformation_id = int(sys.argv[1])
owner_name = sys.argv[2]

transformation = tx.run('''
  MATCH (t:Transformation)
  WHERE ID(t) = toInteger($id)
  RETURN t
''', id=transformation_id).single()['t']

inputs = []
outputs = []

def dataset_input(name):
  names = name.split(':')

  if len(names) > 2:
    raise Exception(f"Cannot parse dataset name {name}")
  elif len(names) == 2:
    org, dataset = names
  else:
    org = owner_name
    dataset = names[0]

  inputs.append([org, dataset])

def dataset_output(name):
  if len(outputs) == 0:
    outputs.append([owner_name, name])
  else:
    print("Transformations can currently only have one output")
    exit(0)

transform_mod = load_transform(transformation['script'],
                               dataset_input,
                               dataset_output)

input_query = '''
  MATCH (t:Transformation)
  WHERE ID(t) = toInteger($id)
  SET t.inputs = [ x in $inputs | x[0] + ':' + x[1] ]
  WITH t
  UNWIND $inputs AS input
  MATCH (d:Dataset { name: input[1] })<-[:OWNER]-(o:Organization { name: input[0] })
  MERGE (d)-[:INPUT]->(t)
'''

output_query = '''
  MATCH (t:Transformation)
  WHERE ID(t) = toInteger($id)
  SET t.outputs = [ x in $outputs | x[0] + ':' + x[1] ]
  WITH t UNWIND $outputs AS output
  MERGE (d:Dataset { name: output[1] })<-[:OWNER]-(o:Organization { name: output[0] })
  MERGE (d)<-[:OUTPUT]-(t)
  SET d.computed = true, d.path = (output[1] + ".csv")
'''

results = tx.run(input_query, id=transformation_id, inputs=inputs)
results = tx.run(output_query, id=transformation_id, outputs=outputs)

tx.commit()
