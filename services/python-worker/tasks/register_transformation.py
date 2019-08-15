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
output_dataset_id = params['outputDatasetId']
owner_name = params['ownerName']
user_uuid = params['userUuid']
transformation_script = params['transformationScript']

valid_org_names = db.valid_org_names(tx, user_uuid)

inputs = []
outputs = []

def transformation_error(message):
  body = {
    "type": "dataset-updated",
    "id": output_dataset_id,
    "status": "error",
    "message": message
  }
  status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))
  raise Exception(message)

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

transform_mod = load_transform(transformation_script,
                               dataset_input,
                               dataset_output)

body = {
  "type": "dataset-updated",
  "task": "register_transformation",
  "id": output_dataset_id,
  "status": "success",
  "message": "",
  "data": {
    "inputs": inputs,
    "outputs": outputs
  }
}

status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))