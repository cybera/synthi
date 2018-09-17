#!/usr/bin/env python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters(host='queue'))
channel = connection.channel()


channel.queue_declare(queue='python-worker')

def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    sys.stdout.flush()

channel.basic_consume(callback,
                      queue='python-worker',
                      no_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
sys.stdout.flush()
channel.start_consuming()