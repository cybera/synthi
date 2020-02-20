import os
import sys

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

import config

# TODO: Being a little too clever here. We should probably take direction from
# the tasks sent by the server in terms of what storage type to use. Then it
# wouldn't need to be configured at all.

try:
  storage_type = config.storage.type
except AttributeError:
  storage_type = "url"

if storage_type == "object":
  from .object import *
elif storage_type == "legacy":
  from .legacy import *
elif storage_type == "url":
  from .url import *
