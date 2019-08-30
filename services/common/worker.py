#!/usr/bin/env python
import sys

import pika

def start(queue, callback):
  connection = pika.BlockingConnection(pika.ConnectionParameters(host='queue', heartbeat=60))

  channel = connection.channel()
  channel.queue_declare(queue=queue)
  channel.basic_consume(queue, callback, auto_ack=True)

  print(' [*] Waiting for messages. To exit press CTRL+C')
  sys.stdout.flush()

  channel.start_consuming()
