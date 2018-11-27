#!/usr/bin/env python

import os, sys, json

import pandas as pd

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import neo4j_driver, status_channel
from lib import data_import

import storage

session = neo4j_driver.session()
tx = session.begin_transaction()

DATASET_ID = int(sys.argv[1])

result = tx.run('''
  MATCH(d: Dataset)
  WHERE ID(d) = toInteger($id)
  RETURN d
''', id=DATASET_ID).single()
dataset = result['d']

df = storage.read_csv(dataset['path'])

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
