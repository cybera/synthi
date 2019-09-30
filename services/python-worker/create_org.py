#!/usr/bin/env python

import sys

from utils import get_neo4j_driver
neo4j_driver = get_neo4j_driver()

if len(sys.argv) <= 1:
  print("Usage: create-org NAME")
  exit()

name = sys.argv[1]

print(f"Creating org: {name}")

session = neo4j_driver.session()
tx = session.begin_transaction()
tx.run('''
CREATE (:Organization { name: $name })
''', name=name)
tx.commit()
