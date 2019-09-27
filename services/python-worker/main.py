#!/usr/bin/env python
import sys
import os
from subprocess import run, CalledProcessError
import json

import pika

from common import worker
from utils import get_status_channel
status_channel = get_status_channel()

WORKER_ROOT = os.path.dirname(os.path.realpath(__file__))

def callback(ch, method, properties, body):
  msg = body.decode('utf8')
  print(f"Received: {msg}")
  sys.stdout.flush()

  params = json.loads(msg)
  process_path = os.path.join(WORKER_ROOT, 'tasks', f"{params['task']}.py")

  body = {
    "type": "task-updated",
    "task": "transform",
    "taskid": params["taskid"],
    "status": "error",
    "message": "",
    "data": {}
  }

  try:
    # Not really sure we can guarantee that the json we get is safe to pass as a
    # single string, so re-encode the python object before passing to the process
    run([process_path, json.dumps(params)], check=True)
  except (OSError, CalledProcessError) as err:
    body["message"] = "An unknown error occurred, please try again later."
    status_channel.basic_publish(exchange='task-status', routing_key='', body=json.dumps(body))

  sys.stdout.flush()

worker.start('python-worker', callback)
