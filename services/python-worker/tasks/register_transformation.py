#!/usr/bin/env python

import sys
import os
import importlib
import pandas as pd
import json
from importlib.machinery import SourceFileLoader

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

import storage
from common import neo4j_driver, load_transform, parse_params, status_channel
import dbqueries as db

session = neo4j_driver.session()
tx = session.begin_transaction()

params = parse_params()
transformation_id = params['id']
owner_name = params['ownerName']
user_uuid = params['userUuid']

valid_org_names = db.valid_org_names(tx, user_uuid)

transformation_info = tx.run('''
  MATCH (t:Transformation)-[:OUTPUT]->(d:Dataset)
  WHERE ID(t) = toInteger($id)
  RETURN t, d
''', id=transformation_id).single()
transformation = transformation_info['t']
output_dataset = transformation_info['d']

inputs = []
outputs = []

def transformation_error(message):
  results = tx.run('''
    MATCH (t:Transformation { uuid: $uuid })
    SET t.error = $message
  ''', uuid=transformation['uuid'], message=message)
  tx.commit()
  body = {
    "type": "dataset-updated",
    "id": output_dataset.id,
    "status": "error",
    "message": message
  }
  status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))
  raise Exception(message)

def clear_transformation_errors():
  tx.run('''
    MATCH (t:Transformation { uuid: $uuid })
    REMOVE t.error
  ''', uuid=transformation['uuid'])

def dataset_input(name, raw=False):
  names = name.split(':')

  if len(names) > 2:
    raise Exception(f"Cannot parse dataset name {name}")
  elif len(names) == 2:
    org, dataset = names
    if org not in valid_org_names:
      transformation_error("You can only transform datasets from organizations you belong to")
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

clear_transformation_errors()

tx.commit()

body = {
  "type": "dataset-updated",
  "id": output_dataset.id,
  "status": "success",
  "message": ""
}
status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))