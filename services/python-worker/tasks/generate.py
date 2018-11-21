#!/usr/bin/env python

import sys
import os
import importlib
import json
import pandas as pd

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import neo4j_driver, status_channel, queue_conn
from common import load_transform

import storage

session = neo4j_driver.session()
tx = session.begin_transaction()

generate_id = int(sys.argv[1])
owner_name = sys.argv[2]

def dataset_input(name):
  names = name.split(":")

  if len(names) > 2:
    raise Exception(f"Cannot parse dataset name {name}")
  elif len(names) == 2:
    org, dataset_name = names
  else:
    org = owner_name
    dataset_name = names[0]

  dataset_by_name_query = '''
MATCH (d:Dataset { name: $name })<-[:OWNER]-(:Organization { name: $org })
  RETURN d.path AS path
  '''
  print(f"Finding '{name}' dataset.")
  results = tx.run(dataset_by_name_query, name=dataset_name, org=org)
  # TODO: more checking here
  dataset = results.single()

  if dataset is None:
    raise Exception(f"Dataset {name} not found")

  return storage.read_csv(dataset['path'])

def dataset_output(name):
  # This is only needed so things don't break if this function is in a transformation
  # It's only really relevant when registering the transformation. By the time we get
  # here, we have enough hooked up in the graph to figure out the output node.
  pass

def write_output(df, owner, output_name):
  # TODO: Since we can now figure out the exact path from the transformations query,
  # it's not really necessary to figure that out again via the more brittle name lookup.
  columns = [dict(name=name,order=i+1) for i, name in enumerate(df.columns)]

  # TODO: Why is this returning five identical results?
  update_dataset_query = '''
    MATCH (dataset:Dataset { name: $name })<-[:OWNER]-(o:Organization)
    WHERE ID(o) = $owner
    WITH dataset
    UNWIND $columns AS column
    MERGE (dataset)<-[:BELONGS_TO]-(:Column { name: column.name, order: column.order, originalName: column.name })
    WITH dataset
    SET dataset.generating = false
    RETURN ID(dataset) AS id, dataset.name AS name, dataset.path AS path
  '''
  results = tx.run(update_dataset_query, owner=owner, name=output_name, columns=columns)
  dataset = results.single()
  print(f"Updating calculated '{output_name}' dataset.")
  storage.write_csv(df, dataset['path'])

find_transforms_query = '''
MATCH full_path = (output:Dataset)<-[*]-(last)
WHERE ID(output) = toInteger($output_id) AND
      ((last:Dataset AND last.computed = false) OR last:Transformation)
WITH full_path, output
MATCH (t:Transformation)
MATCH individual_path = (output)<-[*]-(t)
WHERE t IN nodes(full_path)
WITH DISTINCT(individual_path), t
MATCH (t)-[:OUTPUT]->(individual_output:Dataset)<-[:OWNER]-(o:Organization)
RETURN
  t.name AS name,
  t.script AS script,
  length(individual_path) AS distance,
  ID(individual_output) AS output_id,
  individual_output.name AS output_name,
  individual_output.path AS output_path,
  ID(o) AS owner
ORDER BY distance DESC
'''
print(f"Finding and ordering transforms for ID: {generate_id}.")
transforms = tx.run(find_transforms_query, output_id=generate_id)

body = {
  "type": "dataset-updated",
  "id": generate_id,
  "status": "success",
  "message": ""
}

try:
  for t in transforms:
    transform_script = t['script']
    print(f"Running {transform_script}")
    transform_mod = load_transform(transform_script, dataset_input, dataset_output)
    transform_result = transform_mod.transform()
    write_output(transform_result, t['owner'], t['output_name'])
except Exception as e:
  body["status"] = "failed"
  body["message"] = repr(e)

# Just in case, we know we're done trying at this point and should
# reset the dataset's generating status.
tx.run('''
MATCH (d:Dataset)
WHERE ID(d) = toInteger($id)
SET d.generating = false
''', id=generate_id)

tx.commit()

status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))

queue_conn.close()
