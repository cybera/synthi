#!/usr/bin/env python

import sys

from common import neo4j_driver

if len(sys.argv) != 3:
  print("Usage: create-user USERNAME ORGANIZATION")
  exit()

username = sys.argv[1]
org = sys.argv[2]

print(f"Adding {username} to {org}")

session = neo4j_driver.session()
tx = session.begin_transaction()
tx.run('''
MATCH (o:Organization { name: $org }), (u:User { username: $username })
CREATE (u)-[:MEMBER]->(o)
''', username=username, org=org)
tx.commit()
