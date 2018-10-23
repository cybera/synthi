import pandas as pd
import os

DATA_ROOT = os.environ['DATA_ROOT']

def read_csv(relative_path):
  abs_path = os.path.join(DATA_ROOT, relative_path)
  pd.read_csv(abs_path)

def write_csv(df, relative_path):
  abs_path = os.path.join(DATA_ROOT, relative_path)
  df.to_csv(abs_path, index=False)