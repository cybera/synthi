import pandas as pd

import openstack
from io import BytesIO
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
  obj = object_store().download_object(relative_path, 'adi')
  bio = BytesIO(obj)
  return pd.read_csv(bio)

def write_csv(df, relative_path):
  object_store().upload_object(container='adi',
                               name=relative_path,
                               data=df.to_csv(index=False))
