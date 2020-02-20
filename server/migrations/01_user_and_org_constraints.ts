import Transaction from 'neo4j-driver/types/v1/transaction'

// Create constraints that ensure we can never have more than one user or
// organization with the same name
export default async function migrate(tx: Transaction): Promise<void> {
  await tx.run('CREATE CONSTRAINT ON (user:User) ASSERT user.username IS UNIQUE')
  await tx.run('CREATE CONSTRAINT ON (organization:Organization) ASSERT organization.name IS UNIQUE')
}
