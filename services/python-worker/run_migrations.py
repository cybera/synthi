#!/usr/bin/env python

import glob
import os
import importlib.util

from utils import get_neo4j_driver
neo4j_driver = get_neo4j_driver()

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
MIGRATIONS_DIR = os.path.join(SCRIPT_DIR, "migrations")

session = neo4j_driver.session()

def run_from_file(path):
  modname = os.path.basename(path)
  spec = importlib.util.spec_from_file_location(modname, path)
  mod = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(mod)

  print(f"Migration: {modname}")
  tx = session.begin_transaction()
  mod.migrate(tx)
  tx.commit()

migrations = glob.glob(os.path.join(MIGRATIONS_DIR, "*.py"))

for migration in sorted(migrations):
  run_from_file(migration)