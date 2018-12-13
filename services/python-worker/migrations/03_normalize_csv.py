import os, sys

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from tasks.import_csv import store_csv
import storage

def migrate(tx):
  results = tx.run('MATCH (d:Dataset) RETURN d')
  for result in results:
    try:
      dataset = result['d']
      print(f"Migrating {dataset['name']}:{dataset['path']}")
      if dataset['path']:
        data = storage.read_raw(dataset['path'])
        name, ext = os.path.splitext(dataset['path'])
        normalized_path = f"{dataset['uuid']}/original{ext}"
        if storage.exists(normalized_path):
          print(f"  {dataset['name']}:{dataset['path']} already has normalized version:")
          print(f"  {normalized_path}")
          print("  Skipping...")
        else:
          storage.write_raw(data, normalized_path)
          params = { "encoding": "utf8"}
          df = storage.read_csv(dataset['path'], params)
          store_csv(df, dataset)
      else:
        print("  Backing path not found. Skipping...")
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