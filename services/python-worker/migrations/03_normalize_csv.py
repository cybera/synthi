import os, sys

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

import common.storage as storage

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

def migrate(tx):
  results = tx.run('MATCH (d:Dataset) RETURN d')
  for result in results:
    try:
      dataset = result['d']
      print(f"Migrating {dataset['name']}:{dataset['path']}")
      name, ext = os.path.splitext(dataset['path'])
      normalized_path = f"{dataset['uuid']}/original{ext}"
      if dataset['path'] and not storage.exists(normalized_path):
        data = storage.read_raw(dataset['path'])
        storage.write_raw(data, normalized_path)
        params = { "encoding": "utf8"}
        df = storage.read_csv(dataset['path'], params)
        store_csv(df, dataset)
      else:
        if not dataset['path']:
          print("  Backing path not found. Skipping...")
        else:
          print(f"  {dataset['name']}:{dataset['path']} already has normalized version:")
          print(f"  {normalized_path}")
          print("  Skipping...")

    except Exception as error:
      error_msg = str(error)
      indented_msg = "\n".join([f"  {line}" for line in error_msg.split("\n")])
      print(f"  Problem migrating {dataset['name']}:{dataset['path']}")
      print(indented_msg)
  print("Setting Dataset.originalFilename to Dataset.path")
  tx.run('''
    MATCH (d:Dataset)
    WHERE NOT EXISTS(d.originalFilename) AND
          EXISTS(d.path)
    SET d.originalFilename = d.path
  ''')
