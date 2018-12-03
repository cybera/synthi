#!/usr/bin/env python

import os, sys, json

import pandas as pd

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import neo4j_driver, status_channel, parse_params
from lib import data_import

import storage

session = neo4j_driver.session()
tx = session.begin_transaction()

params = parse_params()
DATASET_ID = params['id']

result = tx.run('''
  MATCH(d: Dataset)
  WHERE ID(d) = toInteger($id)
  RETURN d
''', id=DATASET_ID).single()
dataset = result['d']

if 'removeExisting' in params:
  print('Removing existing columns...')
  tx.run('''
    MATCH(d: Dataset)<-[:BELONGS_TO]-(c:Column)
    WHERE ID(d) = toInteger($id)
    DETACH DELETE c
  ''', id=dataset.id)

# Read the CSV file enough to extract metadata about the columns
# If there is no information about column names supplied in a header,
# make sure to supply generated string column names
csv_parse_params = data_import.csv_params(params)
df = storage.read_csv(dataset['path'], params=csv_parse_params)
data_import.ensure_column_names(df)
storage.write_csv(df, f"{dataset['uuid']}/imported.csv")

columns = data_import.column_info(df)

update_dataset_query = '''
  MATCH (dataset:Dataset)
  WHERE ID(dataset) = toInteger($id)
  WITH dataset
  UNWIND $columns AS column
  MERGE (dataset)<-[:BELONGS_TO]-(:Column { name: column.name, order: column.order })
  WITH DISTINCT dataset
  UNWIND $columns AS column
  MATCH (dataset)<-[:BELONGS_TO]-(c:Column { name: column.name })
  SET c.order = column.order
  WITH DISTINCT dataset
  RETURN dataset
'''

result = tx.run(update_dataset_query, id=dataset.id, columns=columns).single()

updated_dataset = result['dataset']

for column in columns:
  update_column_tags_query = '''
    MATCH (t:Tag)
    WHERE t.name IN $column.tags
    MATCH (dataset:Dataset)<-[:BELONGS_TO]-(c:Column { name: $column.name })
    WHERE ID(dataset) = toInteger($id)
    MERGE (t)-[:DESCRIBES]->(c)
  '''
  tx.run(update_column_tags_query, id=dataset.id, column=column)

tx.commit()

body = {
  "type": "dataset-updated",
  "id": DATASET_ID,
  "status": "success",
  "message": ""
}

status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))
