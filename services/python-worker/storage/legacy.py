from importlib.util import spec_from_file_location, module_from_spec

import os
import config

import pandas as pd

DATA_ROOT = config.storage.legacy.dataRoot

def read_csv(relative_path):
  abs_path = os.path.join(DATA_ROOT, 'datasets', relative_path)
  return pd.read_csv(abs_path)

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
