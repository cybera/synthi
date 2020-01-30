#!/usr/bin/env python
from common import storage

from subprocess import run, PIPE
import json
import os
import sys

import requests

params = json.loads(sys.argv[1])
print("Received:", params)
sys.stdout.flush()

body = {
  "type": "task-updated",
  "task": "import_document",
  "taskid": params["taskid"],
  "token": params["token"],
  "status": "success",
  "message": "",
}

try:
  document = storage.read_raw(params['paths']['original'])
  p = run(["java", "-jar", "/tika-app.jar", "--config=tika-config.xml", "-t", "-"], stdout=PIPE, input=document)
  output = p.stdout
  if type(output) is str:
    output = output.encode('utf-8')
  storage.write_raw(output, params['paths']['imported'])
except Exception as e:
  body['status'] = "error"
  body['message'] = str(e)

requests.post(params['callback'], json=body)
