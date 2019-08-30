import os
import sys
import json
from contextlib import contextmanager

from neo4j.v1 import GraphDatabase
import pika
import common.storage as storage
import common.config as config

queue_conn = pika.BlockingConnection(pika.ConnectionParameters(host='queue'))
status_channel = queue_conn.channel()
status_channel.exchange_declare(exchange='task-status', exchange_type='fanout')

neo4j_uri = f"{config.neo4j.protocol}://{config.neo4j.host}:{config.neo4j.port}"
neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=(config.neo4j.username,config.neo4j.password))

def load_transform(script_path, dataset_input, dataset_output):
  transform_mod = storage.read_script_module(script_path)

  transform_mod.dataset_input = dataset_input
  transform_mod.dataset_output = dataset_output

  transform_mod.__spec__.loader.exec_module(transform_mod)

  storage.cleanup_script_module(transform_mod)

  return transform_mod

def parse_params():
  msg = sys.argv[1]
  return json.loads(msg)

def get_full_name(name, owner_name):
  names = name.split(":")

  if len(names) > 2:
    raise Exception(f"Cannot parse dataset name {name}")
  elif len(names) == 2:
    org, dataset_name = names
  else:
    org = owner_name
    dataset_name = names[0]

  return f'{org}:{dataset_name}'