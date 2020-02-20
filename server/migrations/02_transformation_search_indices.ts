import Transaction from 'neo4j-driver/types/v1/transaction'

// Create search indexes
export default async function migrate(tx: Transaction): Promise<void> {
  await tx.run(`
    CALL apoc.index.addAllNodes("DefaultTransformationSearchIndex", {
      Tag: ["name"],
      Transformation: ["name", "inputs"]
    }, { autoUpdate: true })
  `)
}
