from io import BytesIO
import os
from importlib.util import spec_from_file_location, module_from_spec
from tempfile import NamedTemporaryFile

import pandas as pd

import openstack
import config

conn = None

def object_store():
  global conn

  if not conn:
    conn = openstack.connect(
      auth_url=config.storage.object.creds.authUrl,
      project_name=config.storage.object.creds.tenantName,
      username=config.storage.object.creds.username,
      password=config.storage.object.creds.password,
      region_name=config.storage.object.creds.region
    )

  return conn.object_store


def read_csv(relative_path):
  container = config.storage.object.containers['datasets']
  obj = object_store().download_object(relative_path, container)
  bio = BytesIO(obj)
  return pd.read_csv(bio)

def write_csv(df, relative_path):
  container = config.storage.object.containers['datasets']
  object_store().upload_object(container=container,
                               name=relative_path,
                               data=df.to_csv(index=False))

def read_script_module(relative_path):
  container = config.storage.object.containers['scripts']
  obj = object_store().download_object(relative_path, container)

  # Write to a temporary file so we can load the script
  temp_script = NamedTemporaryFile(delete=False, suffix='.py')
  temp_script.write(obj)
  temp_script.close()

  # Load the script as a module
  transform_spec = spec_from_file_location("transform", temp_script.name)
  transform_module = module_from_spec(transform_spec)

  return transform_module

def cleanup_script_module(script_module):
  # since the source file is a temp one written from object storage,
  # we'll want to clean it up
  os.unlink(script_module.__file__)
