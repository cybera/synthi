#!/usr/bin/env python
import pika
import sys
import os
from subprocess import call
import re
import json

ENGINE_ROOT = os.path.dirname(os.path.realpath(__file__))
SCRIPT_ROOT = os.environ['SCRIPT_ROOT']

connection = pika.BlockingConnection(pika.ConnectionParameters(host='queue', heartbeat=0))
channel = connection.channel()


channel.queue_declare(queue='python-worker')

def callback(ch, method, properties, body):
    msg = body.decode('utf8')
    print(f"Received: {msg}")
    sys.stdout.flush()
    params = json.loads(msg)
    engine_path = os.path.join(ENGINE_ROOT, 'engine.py')
    call([engine_path, str(params['id'])])
    print("Done")
    sys.stdout.flush()

channel.basic_consume(callback,
                      queue='python-worker',
                      no_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
sys.stdout.flush()
channel.start_consuming()