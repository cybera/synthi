#!/usr/bin/env python

import os, sys, json

import pandas as pd

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import neo4j_driver, status_channel, parse_params
from lib import data_import

import storage

# When importing, we take a sample of the dataset's rows and store that
# as well. For really small datasets, this could be the whole thing, and
# we may want to consider a much higher number. The most important thing
# is to keep it small enough to cut down on the transfer time when bringing
# it straight from object storage.
SAMPLE_SIZE=100

def store_csv(df, dataset):
  # Write out normalized versions of the CSV file. These will have header
  # rows, even if the original data has none (auto-generated headers will
  # be generic: 'Column_1', 'Column_2', etc.). This makes it easier for
  # anything reading this data, as it can assume a single way of storing
  # CSV files that we can't assume during the import process.
  sample_size = min(df.shape[0], SAMPLE_SIZE)
  storage.write_csv(df, f"{dataset['uuid']}/imported.csv")
  storage.write_csv(df.sample(sample_size), f"{dataset['uuid']}/sample.csv")

def import_csv(params):
  session = neo4j_driver.session()
  tx = session.begin_transaction()

  dataset_id = params['id']

  result = tx.run('''
    MATCH(d: Dataset)
    WHERE ID(d) = toInteger($id)
    RETURN d
  ''', id=dataset_id).single()
  dataset = result['d']

  # If this parameter exists, we'll wipe out all the existing columns before
  # adding new ones. This allows us to fix a dataset that may have initially
  # gotten through the parser but was parsed incorrectly.
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
  df = storage.read_csv(params['paths']['original'], params=csv_parse_params)
  data_import.ensure_column_names(df)

  # Actually store various versions of the csv in object storage
  store_csv(df, dataset)

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
    "id": dataset_id,
    "status": "success",
    "message": ""
  }

  status_channel.basic_publish(exchange='dataset-status', routing_key='', body=json.dumps(body))

if __name__ == "__main__":
  params = parse_params()
  import_csv(params)
