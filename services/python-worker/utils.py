import os
import sys
import json
from contextlib import contextmanager

from neo4j.v1 import GraphDatabase
import pika
import common.storage as storage
import common.config as config

from adi.dev.transformation import Transformation

def get_queue_conn():
  queue_conn = pika.BlockingConnection(pika.ConnectionParameters(host='queue'))
  queue_conn.channel().exchange_declare(exchange='task-status', exchange_type='fanout')
  return queue_conn

def get_status_channel(queue_conn = None):
  if queue_conn:
    return  queue_conn.channel()
  else:
    return get_queue_conn().channel()

def get_neo4j_driver():
  neo4j_uri = f"{config.neo4j.protocol}://{config.neo4j.host}:{config.neo4j.port}"
  neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=(config.neo4j.username,config.neo4j.password))
  return neo4j_driver

def load_transform(script_path):
  transform_mod = storage.read_script_module(script_path)

  transform_mod.__spec__.loader.exec_module(transform_mod)

  transformations = find_transformations(transform_mod)
  if len(transformations) == 0:
    raise Exception("No transformations found in module")
  elif len(transformations) > 1:
    # TODO: Match name of overall transformation, allowing multiple to be defined
    # but still only using a single entrypoint
    raise Exception("We currently only support one transformation per file")

  transform_mod.entrypoint = transformations[0]

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

def find_transformations(transform_mod):
  def modvar(v):
    return getattr(transform_mod, v)

  modvars = transform_mod.__dir__()

  return [modvar(v) for v in modvars if isinstance(modvar(v), Transformation)]