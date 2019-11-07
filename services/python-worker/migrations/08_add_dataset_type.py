# Somehow we got to a point on longer running versions where some
# datasets don't have a type. Type is now an expected field for a
# dataset, and new ones that get created will have it. It was added
# when we were first creating document datasets, so it's pretty safe
# to assume a dataset that doesn't have a type is a 'csv' one.

def migrate(tx):
  tx.run('''
    MATCH (dataset:Dataset)
    WHERE NOT EXISTS(dataset.type)
    SET dataset.type = 'csv'
  ''')
