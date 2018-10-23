#!/usr/bin/env python

import os, sys, json

import pandas as pd

from common import neo4j_driver, status_channel, DATA_ROOT

session = neo4j_driver.session()
tx = session.begin_transaction()

DATASET_ID = int(sys.argv[1])

result = tx.run('''
  MATCH(d: Dataset)
  WHERE ID(d) = toInteger($id)
  RETURN d
''', id=DATASET_ID).single()
dataset = result['d']

dataset_path = os.path.join(DATA_ROOT, dataset['path'])

df = pd.read_csv(dataset_path)

columns = [dict(name=name,order=i+1) for i, name in enumerate(df.columns)]

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

tx.commit()

body = {
  "type": "dataset-updated",
  "id": DATASET_ID,
  "status": "success",
  "message": ""
}

status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))
