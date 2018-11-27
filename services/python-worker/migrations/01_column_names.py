# This script fixes an issue where data will not display 
# if the column name has been modified

def migrate(tx):
  tx.run('''
    MATCH (c:Column)
    WHERE c.originalName IS NULL
    SET c.originalName = c.name
    RETURN c.name
  ''')