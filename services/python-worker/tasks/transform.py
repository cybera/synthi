#!/usr/bin/env python

import sys
import os
import importlib
import json
import pandas as pd

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from utils import status_channel, queue_conn, parse_params
from utils import load_transform, parse_params, get_full_name

from lib import data_import

import common.storage as storage

SAMPLE_SIZE = 100

def transform_dataset(params):
  owner_name = params["ownerName"]

  def dataset_input(name, raw=False, original=False):
    full_name = get_full_name(name, owner_name)
    if full_name in params['storagePaths']:
      if original:
        path = params['storagePaths'][full_name]['original']
      else:
        path = params['storagePaths'][full_name]['imported']
      if raw:
        return storage.read_raw(path)
      else:
        return storage.read_csv(path)
    
    # If we don't have the dataset in our list of inputs, not much we can do
    raise Exception(f"Dataset {full_name} not found")

  def dataset_output(name):
    # This is only needed so things don't break if this function is in a transformation
    # It's only really relevant when registering the transformation. By the time we get
    # here, we have enough hooked up in the graph to figure out the output node.
    pass

  def write_output(output, owner, output_name):
    full_name = get_full_name(output_name, owner_name)
    path = params["storagePaths"][full_name]["imported"]

    if type(output) is pd.DataFrame:
      columns = data_import.column_info(output)

      print(f"Updating calculated '{output_name}' dataset: {path}")
      store_csv(output, path, params["storagePaths"][full_name]["sample"])

      return { 'type': 'csv', 'columns': columns }
    elif type(output) is str:
      storage.write_raw(output.encode('utf-8'), path)
    else:
      storage.write_raw(output, path)

      return { 'type': 'document', 'columns': [] }

  body = {
    "type": "task-updated",
    "task": "transform",
    "taskid": params["taskid"],
    "status": "success",
    "message": "",
    "data": {}
  }

  try:
    transformation = params["transformation"]
    transform_script = transformation['script']
    print(f"Running {transform_script}")
    transform_mod = load_transform(transform_script, dataset_input, dataset_output)
    transform_result = transform_mod.transform()
    body['data'] = write_output(transform_result, transformation['owner'], transformation['output_name'])
  except Exception as e:
    body["status"] = "error"
    body["message"] = repr(e)

  status_channel.basic_publish(exchange='task-status', routing_key='', body=json.dumps(body))

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
  queue_conn.close()
