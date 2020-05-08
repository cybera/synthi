import Transaction from 'neo4j-driver/types/v1/transaction'

// This script adds basic system tags to the database
export default async function migrate(tx: Transaction): Promise<void> {
  await tx.run(`
    MERGE (:Tag { name: 'Integer', system: true })
    MERGE (:Tag { name: 'Float', system: true })
    MERGE (:Tag { name: 'String', system: true })
    MERGE (:Tag { name: 'Boolean', system: true })
  `)
}
