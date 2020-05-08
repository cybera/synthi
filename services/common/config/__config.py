import os
import toml

class ObjectDict:
  def __init__(self, **response):
    for k,v in response.items():
      if isinstance(v,dict):
        self.__dict__[k] = ObjectDict(**v)
      else:
        self.__dict__[k] = v

  def __getitem__(self, key):
    return self.__dict__[key]

  def __repr__(self):
    return self.__dict__.__repr__()

config_dir = os.path.dirname(os.path.realpath(__file__))
config_entries = toml.load(os.path.join(config_dir, 'development.toml'))

settings = ObjectDict(**config_entries)

for attr_name in dir(settings):
  if not attr_name.startswith('__'):
    globals()[attr_name] = settings.__getattribute__(attr_name)

__all__ = [key for key in dir(settings) if not key.startswith('__')]