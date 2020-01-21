from importlib.util import spec_from_file_location, module_from_spec
from tempfile import NamedTemporaryFile

from magic import Magic
import requests
import pandas as pd

magic = Magic(mime_encoding=True)

def read_raw(url):
  res = requests.get(url)
  if res.status_code != 200:
    raise Error("Failed to read dataset")
  return response.content

def read_csv(url, params={}, detectEncoding=False):
  raw = read_raw(url)
  bio = BytesIO(raw)

  encoding = None
  if detectEncoding:
    # guess the encoding from up to the first 10MB of the file
    encoding = magic.from_buffer(obj[0:1024*1024*10])

  params = { 'encoding': encoding, **params }

  return pd.read_csv(bio, **params)

def write_raw(data, url):
  res = requests.put(url, data)
  if res.status_code != 200 and res.status_code != 201:
    raise Error("Failed to write dataset")

def write_csv(df, url):
  data = df.to_csv(index=False).encode('utf-8')
  write_raw(data, url)

def read_script_module(url):
  raw = read_raw(url)
  res = config.storage.object.containers['scripts']

  # Write to a temporary file so we can load the script
  temp_script = NamedTemporaryFile(delete=False, suffix='.py')
  temp_script.write(raw)
  temp_script.close()

  # Load the script as a module
  transform_spec = spec_from_file_location("transform", temp_script.name)
  transform_module = module_from_spec(transform_spec)

  return transform_module
