import os

storage_type = os.environ['STORAGE_TYPE']

if storage_type == "object":
  from .object import *
elif storage_type == "legacy":
  from .legacy import *
