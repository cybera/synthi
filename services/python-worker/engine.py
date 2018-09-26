#!/usr/bin/env python

import sys
import os
import importlib
import json
import pandas as pd

from common import neo4j_driver, status_channel, queue_conn, SCRIPT_ROOT, DATA_ROOT

session = neo4j_driver.session()
tx = session.begin_transaction()

generate_id = int(sys.argv[1])

def dataset_abspath(dataset):
  return os.path.join(DATA_ROOT, dataset['path'])

def dataset_input(name):
  dataset_by_name_query = '''
  MATCH (d:Dataset { name: $name })
  RETURN d.path AS path
  '''
  print(f"Finding '{name}' dataset.")
  results = tx.run(dataset_by_name_query, name=name)
  # TODO: more checking here
  dataset = results.single()
  return pd.read_csv(dataset_abspath(dataset))

outputs = dict()

def dataset_output(name):
  # TODO: This, and the code in load_transform combine to make something pretty brittle. We want
  # to keep the lack of boilerplate a data scientist has to do to define a transformation, but
  # there are probably better ways...
  outputs[current_loading_transform] = name

def write_output(df, output_name):
  columns = [dict(name=name,order=i+1) for i, name in enumerate(df.columns)]

  update_dataset_query = '''
    MATCH (dataset:Dataset { name: $name })
    WITH dataset
    UNWIND $columns AS column
    MERGE (dataset)<-[:BELONGS_TO]-(:Column { name: column.name, order: column.order })
    WITH dataset
    SET dataset.generating = false
    RETURN ID(dataset) AS id, dataset.name AS name, dataset.path AS path
  '''
  dataset = tx.run(update_dataset_query, name=output_name, columns=columns).single()
  print(f"Updating calculated '{output_name}' dataset.")
  df.to_csv(dataset_abspath(dataset), index=False)
  

current_loading_transform = None

def load_transform(script_path):
  global current_loading_transform
  full_path = os.path.join(SCRIPT_ROOT, script_path)
  transform_spec = importlib.util.spec_from_file_location("transform", full_path)
  transform_mod = importlib.util.module_from_spec(transform_spec)

  transform_mod.dataset_input = dataset_input
  transform_mod.dataset_output = dataset_output

  current_loading_transform = script_path
  transform_spec.loader.exec_module(transform_mod)

  return transform_mod

find_transforms_query = '''
MATCH full_path = (output:Dataset)<-[*]-(input:Dataset { computed: false })
WHERE ID(output) = $output_id
WITH full_path, output
MATCH (t:Transformation)
MATCH individual_path = (output)<-[*]-(t)
WHERE t IN nodes(full_path)
WITH DISTINCT(individual_path), t
RETURN t.name AS name, t.script AS script, length(individual_path) AS distance
ORDER BY distance DESC
'''
print(f"Finding and ordering transforms for ID: {generate_id}.")
transforms = tx.run(find_transforms_query, output_id=generate_id)
for t in transforms:
  transform_script = t['script']
  print(f"Running {transform_script}")
  transform_mod = load_transform(transform_script)
  transform_result = transform_mod.transform()
  write_output(transform_result, outputs[transform_script])

tx.commit()

body = {
  "type": "dataset-updated",
  "id": generate_id
}

status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))

queue_conn.close()