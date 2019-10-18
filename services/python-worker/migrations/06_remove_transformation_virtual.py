# Remove any 'virtual' properties on Transformations. We're computing these.

def migrate(tx):
  tx.run('MATCH (t:Transformation) REMOVE t.virtual')
