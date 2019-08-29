#!/usr/bin/env python
import sys
import os
from subprocess import Popen
import json

import pika

from common import worker

WORKER_ROOT = os.path.dirname(os.path.realpath(__file__))

def callback(ch, method, properties, body):
  msg = body.decode('utf8')
  print(f"Received: {msg}")
  sys.stdout.flush()

  params = json.loads(msg)
  process_path = os.path.join(WORKER_ROOT, 'tasks', f"{params['task']}.py")

  # Not really sure we can guarantee that the json we get is safe to pass as a
  # single string, so re-encode the python object before passing to the process
  encoded_params = json.dumps(params)

  Popen([process_path, json.dumps(params)])

  sys.stdout.flush()

worker.start('python-worker', callback)
