#!/usr/bin/env python

import sys
import os
import json

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from common import status_channel, queue_conn, parse_params
from generate import generate_dataset

params = parse_params()

# We need a more robust job queue... one where jobs can schedule other jobs and
# wait on jobs they schedule to finish before finishing themselves. Since we don't
# have that, we're limited to simple atomic jobs (at least in terms of this message
# queue). Since downloading involves making sure any generation has been done, we're
# calling generate_dataset from the generate task here.

generate_dataset(params)

body = {
  "type": "download-status",
  "id": params["id"],
  "status": "ready",
  "message": ""
}

print(f"Download ready for {params['id']}")
status_channel.basic_publish(exchange='download-status', routing_key='', body=json.dumps(body))

queue_conn.close()
