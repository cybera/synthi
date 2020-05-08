from importlib.util import spec_from_file_location, module_from_spec

import os
import config
from glob import glob

import pandas as pd
from magic import Magic

magic = Magic(mime_encoding=True)

DATA_ROOT = config.storage.legacy.dataRoot

def exists(relative_path):
  abs_path = os.path.join(DATA_ROOT, 'datasets', relative_path)
  return os.path.exists(abs_path)

def bytes(relative_path):
  abs_path = os.path.join(DATA_ROOT, 'datasets', relative_path)
  return os.stat(abs_path).st_size

def read_raw(relative_path):
  abs_path = os.path.join(DATA_ROOT, 'datasets', relative_path)
  data = ""
  with open(relative_path, 'r') as file:
    data = file.read()
  return data

def write_raw(data, relative_path):
  abs_path = os.path.join(DATA_ROOT, 'datasets', relative_path)
  folder = os.path.dirname(abs_path)
  os.makedirs(folder, exist_ok=True)
  with open(abs_path, 'w') as file:
    file.write(data)

def read_csv(relative_path, params=dict(), detectEncoding=False):
  abs_path = os.path.join(DATA_ROOT, 'datasets', relative_path)

  encoding = None
  if detectEncoding:
    encoding = magic.from_file(abs_path)

  params = { 'encoding': encoding, **params }

  return pd.read_csv(abs_path, **params)

def write_csv(df, relative_path):
  abs_path = os.path.join(DATA_ROOT, 'datasets', relative_path)
  df.to_csv(abs_path, index=False)

def read_script_module(relative_path):
  abs_path = os.path.join(DATA_ROOT, 'scripts', relative_path)
  transform_spec = spec_from_file_location("transform", abs_path)
  return module_from_spec(transform_spec)

def cleanup_script_module(script_module):
  # do nothing... we don't want to delete the source file
  pass

def ls(relative_prefix):
  root_path = os.path.join(DATA_ROOT, 'datasets')
  abs_path = os.path.join(root_path, relative_prefix)
  abs_paths = glob(abs_path + '*')
  return [os.path.relpath(abs_path, root_path) for abs_path in abs_paths]
