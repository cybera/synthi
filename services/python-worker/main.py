#!/usr/bin/env python
import pika
import sys
import os
from subprocess import call
import re

SCRIPT_ROOT = os.environ['SCRIPT_ROOT']

connection = pika.BlockingConnection(pika.ConnectionParameters(host='queue'))
channel = connection.channel()


channel.queue_declare(queue='python-worker')

def callback(ch, method, properties, body):
    print(f"{SCRIPT_ROOT}/{body.decode('utf8')}")
    sys.stdout.flush()
    message = re.split('\s+', body.decode('utf8'))
    engine_path = os.path.join(SCRIPT_ROOT, message[0])
    call([engine_path, message[1]])
    print("Done")
    sys.stdout.flush()

channel.basic_consume(callback,
                      queue='python-worker',
                      no_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
sys.stdout.flush()
channel.start_consuming()