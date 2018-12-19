#!/usr/bin/env python

import sys
import os
import importlib
import json
import pandas as pd

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import neo4j_driver, status_channel, queue_conn, parse_params
from common import load_transform, parse_params

import storage

from import_csv import store_csv

def generate_dataset(generate_id, owner_name):
  session = neo4j_driver.session()
  tx = session.begin_transaction()

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
    RETURN d.uuid AS uuid
    '''
    print(f"Finding '{name}' dataset.")
    results = tx.run(dataset_by_name_query, name=dataset_name, org=org)
    # TODO: more checking here
    dataset = results.single()

    if dataset is None:
      raise Exception(f"Dataset {name} not found")

    return storage.read_csv(f"{dataset['uuid']}/imported.csv")

  def dataset_output(name):
    # This is only needed so things don't break if this function is in a transformation
    # It's only really relevant when registering the transformation. By the time we get
    # here, we have enough hooked up in the graph to figure out the output node.
    pass

  def write_output(df, owner, output_name):
    # TODO: Since we can now figure out the exact path from the transformations query,
    # it's not really necessary to figure that out again via the more brittle name lookup.
    columns = [dict(name=name,order=i+1) for i, name in enumerate(df.columns)]

    update_dataset_query = '''
      MATCH (dataset:Dataset { name: $name })<-[:OWNER]-(o:Organization)
      WHERE ID(o) = $owner
      WITH dataset
      UNWIND $columns AS column
      MERGE (dataset)<-[:BELONGS_TO]-(:Column { name: column.name, order: column.order, originalName: column.name })
      WITH DISTINCT dataset
      SET dataset.generating = false
      RETURN ID(dataset) AS id, dataset.name AS name, dataset.uuid AS uuid
    '''
    results = tx.run(update_dataset_query, owner=owner, name=output_name, columns=columns)
    dataset = results.single()
    print(f"Updating calculated '{output_name}' dataset: {dataset['uuid']}/imported.csv.")
    store_csv(df, dataset)

  find_transforms_query = '''
  MATCH full_path = (output:Dataset)<-[*]-(last)
  WHERE ID(output) = toInteger($output_id) AND
        ((last:Dataset AND last.computed = false) OR last:Transformation)
  WITH full_path, output
  MATCH (t:Transformation)
  MATCH individual_path = (output)<-[*]-(t)
  WHERE t IN nodes(full_path) AND NOT EXISTS(t.error)
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

if __name__ == "__main__":
  params = parse_params()
  generate_dataset(params['id'], params['ownerName'])
  queue_conn.close()
