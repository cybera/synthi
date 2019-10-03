# Create constraints that ensure we can never have more than one user or
# organization with the same name

def migrate(tx):
  tx.run('CREATE CONSTRAINT ON (user:User) ASSERT user.username IS UNIQUE')
  tx.run('CREATE CONSTRAINT ON (organization:Organization) ASSERT organization.name IS UNIQUE')
