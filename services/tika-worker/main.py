#!/usr/bin/env python
from common import worker, storage

from subprocess import run, PIPE
import json
import os
import sys

def callback(ch, method, properties, body):
  msg = body.decode('utf-8')
  print("Received:", msg)
  sys.stdout.flush()
  params = json.loads(msg)

  body = {
    "type": "task-updated",
    "task": "import_document",
    "taskid": params["taskid"],
    "status": "success",
    "message": "",
  }

  try:
    document = storage.read_raw(params['paths']['original'])
    p = run(["java", "-jar", "/tika-app.jar", "--config=tika-config.xml", "-t", "-"], stdout=PIPE, input=document)
    storage.write_raw(p.stdout, params['paths']['imported'])
  except Exception as e:
    body['status'] = "error"
    body['message'] = str(e)

  ch.basic_publish(exchange='task-status', routing_key='', body=json.dumps(body))

worker.start('tika-worker', callback)
