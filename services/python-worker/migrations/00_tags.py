# This script adds basic system tags to the database

def migrate(tx):
  tx.run('''
    MERGE (:Tag { name: 'Integer', system: true })
    MERGE (:Tag { name: 'Float', system: true })
    MERGE (:Tag { name: 'String', system: true })
  ''')