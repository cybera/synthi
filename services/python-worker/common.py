import os
from contextlib import contextmanager

from neo4j.v1 import GraphDatabase
import pika
import storage
import config

queue_conn = pika.BlockingConnection(pika.ConnectionParameters(host='queue'))
status_channel = queue_conn.channel()
status_channel.exchange_declare(exchange='dataset-status', exchange_type='fanout')
status_channel.exchange_declare(exchange='download-status', exchange_type='fanout')

neo4j_uri = f"{config.neo4j.protocol}://{config.neo4j.host}:{config.neo4j.port}"
neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=(config.neo4j.username,config.neo4j.password))

def load_transform(script_path, dataset_input, dataset_output):
  transform_mod = storage.read_script_module(script_path)

  transform_mod.dataset_input = dataset_input
  transform_mod.dataset_output = dataset_output

  transform_mod.__spec__.loader.exec_module(transform_mod)

  storage.cleanup_script_module(transform_mod)

  return transform_mod
