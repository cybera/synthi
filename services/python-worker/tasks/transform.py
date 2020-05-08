#!/usr/bin/env python

import sys
import os
import importlib
import json
import pandas as pd
import requests

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from utils import parse_params

from utils import load_transform, parse_params, get_full_name

from lib import data_import

import common.storage as storage

SAMPLE_SIZE = 100

def transform_dataset(params):
  owner_name = params["ownerName"]

  body = {
    "type": "task-updated",
    "task": "transform",
    "token": params["token"],
    "taskid": params["taskid"],
    "status": "success",
    "message": "",
    "data": {}
  }

  try:
    transformation = params["transformation"]
    transform_script = transformation['script']
    print(f"Running {transform_script}")
    transform_mod = load_transform(transform_script)
    run_params = { 'input': params['input'], 'output': params['output'] }
    transform_mod.entrypoint.run(run_params)
    body['data'] = transform_mod.entrypoint.metadata
  except Exception as e:
    body["status"] = "error"
    body["message"] = repr(e)

  requests.post(params['callback'], json=body)

def store_csv(df, path, sample_path):
  # Write out normalized versions of the CSV file. These will have header
  # rows, even if the original data has none (auto-generated headers will
  # be generic: 'Column_1', 'Column_2', etc.). This makes it easier for
  # anything reading this data, as it can assume a single way of storing
  # CSV files that we can't assume during the import process.
  sample_size = min(df.shape[0], SAMPLE_SIZE)
  storage.write_csv(df, path)
  storage.write_csv(df.sample(sample_size), sample_path)

if __name__ == "__main__":
  params = parse_params()
  transform_dataset(params)
