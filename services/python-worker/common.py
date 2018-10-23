import os

from neo4j.v1 import GraphDatabase
import pika

queue_conn = pika.BlockingConnection(pika.ConnectionParameters(host='queue'))
status_channel = queue_conn.channel()
status_channel.exchange_declare(exchange='dataset-status', exchange_type='fanout')

SCRIPT_ROOT=os.environ['SCRIPT_ROOT']

neo4j_uri = "bolt://neo4j:7687"
neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=('neo4j','password'))
