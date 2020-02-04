#!/usr/bin/env python
import sys
import os
from subprocess import run, CalledProcessError
import json

import requests

WORKER_ROOT = os.path.dirname(os.path.realpath(__file__))

params = json.loads(sys.argv[1])
process_path = os.path.join(WORKER_ROOT, 'tasks', f"{params['task']}.py")

body = {
  "type": "task-updated",
  "task": "transform",
  "taskid": params["taskid"],
  "token": params["token"],
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
  requests.post(params["callback"], json=body)

sys.stdout.flush()
