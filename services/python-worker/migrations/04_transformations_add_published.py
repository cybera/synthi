def migrate(tx):
  tx.run('''
    MATCH (:Organization)-[:OWNER]->(transformation:Transformation)
    SET transformation.published = COALESCE(transformation.published, false)
  ''')