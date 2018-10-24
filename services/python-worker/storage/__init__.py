import os

# TODO: Being a little too clever here. Can't load config in because of
# relative path issues. Might want to consider just a generator method
# and/or turning things into classes

storage_type = os.environ['STORAGE_TYPE']

if storage_type == "object":
  from .object import *
elif storage_type == "legacy":
  from .legacy import *
