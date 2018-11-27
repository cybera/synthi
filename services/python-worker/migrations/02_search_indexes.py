# Create search indexes

def migrate(tx):
  tx.run('''
    CALL apoc.index.addAllNodes("DefaultDatasetSearchIndex", {
      DatasetMetadata: ["title", "contributor", "contact", "description", "source", "identifier", "theme"],
      Column: ["name"],
      Dataset: ["name"]
      }, { autoUpdate: true })
  ''')
