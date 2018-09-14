#!/usr/bin/env python

import sys
import os
import importlib
import pandas as pd
from importlib.machinery import SourceFileLoader
from neo4j.v1 import GraphDatabase

# TODO: Make this more configurable. Eventually, we'll want to support object storage
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
OUTPUT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "data", "uploads"))

neo4j_uri = "bolt://localhost:7687"
neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=('neo4j','password'))
session = neo4j_driver.session()
tx = session.begin_transaction()

script = sys.argv[1]

script_path = os.path.abspath(script)
transform_name = os.path.splitext(os.path.basename(script_path))[0]

print(script_path)

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

transform_query = '''
MERGE(t:Transformation { script: $script })
ON CREATE SET t.name = $transform_name
'''

results = tx.run(transform_query, script=script_path, transform_name=transform_name)
for r in results:
  print(r)

input_query = '''
MATCH (t:Transformation { script: $script })
MATCH (input:Dataset { name: $name })
MERGE (input)-[:INPUT]->(t)
'''

output_query = '''
MATCH (t:Transformation { script: $script })
MERGE (output:Dataset { name: $name })
MERGE (output)<-[:OUTPUT]-(t)
ON CREATE SET output.computed = true, output.path = $output_path
''' 

for i in inputs:
  results = tx.run(input_query, name=i, script=script_path)
  for r in results:
    print(r)

for o in outputs:
  output_path = os.path.join(OUTPUT_ROOT, f"{o}.csv")
  results = tx.run(output_query, name=o, script=script_path, output_path=output_path)
  for r in results:
    print(r)

tx.commit()