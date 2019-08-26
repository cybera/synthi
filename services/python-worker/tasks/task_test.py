#!/usr/bin/env python

import sys
import os
import json

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import parse_params, status_channel

params = parse_params()

body = {
  "type": "task-updated",
  "task": "task_test",
  "taskid": params['taskid'],
  "status": "success",
  "message": ""
}

status_channel.basic_publish(exchange='task-status', routing_key='', body=json.dumps(body))