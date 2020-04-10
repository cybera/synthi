#!/usr/bin/env python

import sys
import os
import importlib
import pandas as pd
import json
import requests
from importlib.machinery import SourceFileLoader

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

import common.storage as storage
from utils import load_transform, parse_params
import dbqueries as db

params = parse_params()

transformation_script = params['transformationScript']

inputs = []
outputs = []

def transformation_error(error):
  body = {
    "task": "register_transformation",
    "taskid": params["taskid"],
    "token": params["token"],
    "type": "task-updated",
    "status": "error",
    "message": repr(error)
  }
  requests.post(params['callback'], json=body)
  raise error

try:
  transform_mod = load_transform(transformation_script)
  transformation = transform_mod.entrypoint
  inputs = [{ 'name': v['ref'], 'alias': k } for k,v in transformation.inputs.items() if v['reftype'] == 'dataset']
except Exception as error:
  transformation_error(error)

body = {
  "task": "register_transformation",
  "taskid": params["taskid"],
  "token": params["token"],
  "type": "task-updated",
  "status": "success",
  "message": "",
  "data": {
    "inputs": inputs,
    "outputs": outputs
  }
}

requests.post(params['callback'], json=body)
