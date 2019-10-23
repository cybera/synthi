import os, sys

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

import common.storage as storage

def check_path(dataset):
  for stage in ["original", "imported"]:
    normalized_path_prefix = f"{dataset['uuid']}/{stage}"
    normalized_paths = storage.ls(normalized_path_prefix)
    if normalized_paths:
      return normalized_paths[0]

  return None

def migrate(tx):
  results = tx.run('MATCH (d:Dataset)-[:HAS_METADATA]->(dm:DatasetMetadata) RETURN d, dm')
  for result in results:
    dataset = result['d']
    metadata = result['dm']
    has_bytes = 'bytes' in dataset and dataset['bytes']
    has_format = 'format' in metadata and dataset['format']

    if not(has_bytes and has_format):
      try:
        path = check_path(dataset)

        if storage.exists(path):
          if not has_bytes:
            dataset_bytes = storage.bytes(path)
            tx.run('''
              MATCH (d:Dataset { uuid: $uuid })
              SET d.bytes = $bytes
            ''', uuid=dataset['uuid'], bytes=dataset_bytes)

          if not has_format:
            (_, dataset_ext) = os.path.splitext(path)
            dataset_format = dataset_ext.lstrip('.')
            tx.run('''
              MATCH (dm:DatasetMetadata { uuid: $uuid })
              SET dm.format = $format
            ''', uuid=metadata['uuid'], format=dataset_format)
      except Exception as error:
        error_msg = str(error)
        indented_msg = "\n".join([f"  {line}" for line in error_msg.split("\n")])
        print(f"  Problem migrating {dataset['name']}:{dataset['path']}")
        print(indented_msg)
