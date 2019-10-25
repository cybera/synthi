# This script adds basic transformation tags to the database

def migrate(tx):
  tx.run('''
    MERGE (:Tag { name: 'Join', system: true })
    MERGE (:Tag { name: 'Merge', system: true })
    MERGE (:Tag { name: 'Concatenate', system: true })
    MERGE (:Tag { name: 'Mean', system: true })
    MERGE (:Tag { name: 'Median', system: true })
    MERGE (:Tag { name: 'Mode', system: true })
    MERGE (:Tag { name: 'Count', system: true })
    MERGE (:Tag { name: 'Upper', system: true })
    MERGE (:Tag { name: 'Lower', system: true })
    MERGE (:Tag { name: 'Sum', system: true })
    MERGE (:Tag { name: 'Difference', system: true })
  ''')
