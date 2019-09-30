from io import BytesIO
import os
from importlib.util import spec_from_file_location, module_from_spec
from tempfile import NamedTemporaryFile

import pandas as pd
from magic import Magic

import openstack
import config

magic = Magic(mime_encoding=True)

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

def exists(relative_path):
  object_exists = True
  try:
    container = config.storage.object.containers['datasets']
    object_store().get_object_metadata(container=container, obj=relative_path)
  except openstack.exceptions.ResourceNotFound as error:
    object_exists = False

  return object_exists

def read_raw(relative_path):
  container = config.storage.object.containers['datasets']
  obj = object_store().download_object(relative_path, container)
  return obj

def write_raw(data, relative_path):
  container = config.storage.object.containers['datasets']
  object_store().upload_object(container=container,
                               name=relative_path,
                               data=data)

def read_csv(relative_path, params=dict(), detectEncoding=False):
  obj = read_raw(relative_path)
  bio = BytesIO(obj)

  encoding = None
  if detectEncoding:
    # guess the encoding from up to the first 10MB of the file
    encoding = magic.from_buffer(obj[0:1024*1024*10])

  params = { 'encoding': encoding, **params }

  return pd.read_csv(bio, **params)

def write_csv(df, relative_path):
  data = df.to_csv(index=False).encode('utf-8')
  write_raw(data, relative_path)

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
