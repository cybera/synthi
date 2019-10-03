#!/usr/bin/env python

import os, sys, json, re

import pandas as pd

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from utils import get_status_channel, parse_params
status_channel = get_status_channel()
from lib import data_import

import common.storage as storage
from contextlib import redirect_stderr
from io import StringIO

# For some reason, when turning error_log_output on in pandas and trying
# to capture stderr (the only way to grab the parsing error output), each
# line gets written as a string, but looks like it was originally a binary,
# which results in a bunch of "b'some string'" output, as well as "\\n"
# instead of "\n". This is undoes that.
class PandasErrorStringIO(StringIO):
  def write(self, s):
    s = re.sub("^b'(.*)'$", "\\1", s)
    s = s.replace('\\n', '\n')
    super().write(s)

error_log = PandasErrorStringIO()

# When importing, we take a sample of the dataset's rows and store that
# as well. For really small datasets, this could be the whole thing, and
# we may want to consider a much higher number. The most important thing
# is to keep it small enough to cut down on the transfer time when bringing
# it straight from object storage.
SAMPLE_SIZE=100

def import_csv(params):
  # Read the CSV file enough to extract metadata about the columns
  # If there is no information about column names supplied in a header,
  # make sure to supply generated string column names
  csv_parse_params = data_import.csv_params(params)
  csv_parse_params['warn_bad_lines'] = True
  csv_parse_params['error_bad_lines'] = False

  with redirect_stderr(error_log):
    df = storage.read_csv(params['paths']['original'], params=csv_parse_params, detectEncoding=True)

  data_import.ensure_column_names(df)

  # Write out normalized versions of the CSV file. These will have header
  # rows, even if the original data has none (auto-generated headers will
  # be generic: 'Column_1', 'Column_2', etc.). This makes it easier for
  # anything reading this data, as it can assume a single way of storing
  # CSV files that we can't assume during the import process.
  sample_size = min(df.shape[0], SAMPLE_SIZE)
  storage.write_csv(df, params['paths']['imported'])
  storage.write_csv(df.sample(sample_size), params['paths']['sample'])
  error_log_output = error_log.getvalue().strip()
  error_log.close()

  columns = data_import.column_info(df)

  body = {
    "type": "task-updated",
    "task": "import_csv",
    "taskid": params["taskid"],
    "status": "success",
    "message": "",
    "data": {
      "columns": columns
    }
  }
  
  if error_log_output:
    storage.write_raw(error_log_output, os.path.join(os.path.dirname(params['paths']['original']), 'error.log'))
    body['import_errors'] = True

  status_channel.basic_publish(exchange='task-status', routing_key='', body=json.dumps(body))

if __name__ == "__main__":
  params = parse_params()
  import_csv(params)
