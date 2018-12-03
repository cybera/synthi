#!/usr/bin/env python
import sys
import os
from subprocess import Popen
import json

import pika

WORKER_ROOT = os.path.dirname(os.path.realpath(__file__))

connection = pika.BlockingConnection(pika.ConnectionParameters(host='queue', heartbeat=60))
channel = connection.channel()


channel.queue_declare(queue='python-worker')

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

channel.basic_consume(callback,
                      queue='python-worker',
                      no_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
sys.stdout.flush()
channel.start_consuming()
