# Create search indexes

def migrate(tx):
  tx.run('''
    CALL apoc.index.addAllNodes("DefaultTransformationSearchIndex", {
      Tag: ["name"],
      Transformation: ["name", "inputs"]
    }, { autoUpdate: true })
  ''')
