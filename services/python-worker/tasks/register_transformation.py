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
from common import load_transform, parse_params, status_channel
import dbqueries as db

params = parse_params()

transformation_script = params['transformationScript']

inputs = []
outputs = []

def transformation_error(message):
  body = {
    "task": "register_transformation",
    "taskid": params["taskid"],
    "type": "task-updated",
    "status": "error",
    "message": message
  }
  status_channel.basic_publish(exchange='task-status', routing_key='', body=json.dumps(body))
  raise Exception(message)

def dataset_input(name, raw=False):
  inputs.append(name)

def dataset_output(name):
  if len(outputs) == 0:
    inputs.append(name)
  else:
    print("Transformations can currently only have one output")
    exit(0)

transform_mod = load_transform(transformation_script,
                               dataset_input,
                               dataset_output)

body = {
  "task": "register_transformation",
  "taskid": params["taskid"],
  "type": "task-updated",
  "status": "success",
  "message": "",
  "data": {
    "inputs": inputs,
    "outputs": outputs
  }
}

status_channel.basic_publish(exchange='task-status', routing_key='', body=json.dumps(body))