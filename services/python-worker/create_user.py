#!/usr/bin/env python

import sys, getpass
import bcrypt

from utils import get_neo4j_driver
neo4j_driver = get_neo4j_driver()

if len(sys.argv) <= 1:
  print("Usage: create-user USERNAME")
  exit()

username = sys.argv[1]

# non-interactive password
if len(sys.argv) > 2:
  password = sys.argv[2]
  confirm = sys.argv[2]
else:
  password = None
  confirm = None

# non-interactive apitoken
if len(sys.argv) > 3:
  apikey = sys.argv[3]
else:
  apikey = None

while not (password and confirm) or (password != confirm):
  password = getpass.getpass()
  confirm = getpass.getpass(prompt='Confirm Password: ')
  if password != confirm:
    print("Password and confirmation don't match... please try again")

salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password.encode('utf-8'),salt)

print(f"Created password hash: {hashed_password}")
password_check = bcrypt.checkpw(password.encode('utf-8'), hashed_password)
print(f"Checking password: {password_check}")
print(f"Creating user: {username}")

session = neo4j_driver.session()
tx = session.begin_transaction()
tx.run('''
CREATE (:Organization { name: $username })<-[:MEMBER]-(:User { username: $username, password: $password })
''', username=username, password=hashed_password.decode('utf-8'))
if apikey:
  tx.run('''
  MATCH (u:User { username: $username }) SET u.apikey = $apikey
  ''', username=username, apikey=apikey
  )
tx.commit()
