#!/usr/bin/env python

import sys, getpass
import bcrypt

from common import neo4j_driver

if len(sys.argv) <= 1:
  print("Usage: create-user USERNAME")
  exit()

username = sys.argv[1]

password = None
confirm = None

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
tx.commit()
