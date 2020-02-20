/* eslint-disable no-console */
import fs from 'fs'

import neo4jConnection from '../neo4j/connection'

async function runMigrations(): Promise<void> {
  const session = neo4jConnection.session()

  let fileNames = fs.readdirSync('migrations/')
  fileNames = fileNames.sort()

  try {
    // eslint-disable-next-line no-restricted-syntax
    for await (const fn of fileNames) {
      console.log(`    * ${fn}`)
      const tx = session.beginTransaction()
      const migration = await import(`../migrations/${fn}`)
      await migration.default(tx)
      await tx.commit()
    }
  } finally {
    session.close()
  }
}

console.log('Running migrations...')
runMigrations().then(() => {
  console.log('Migrations completed')
  process.exit(0)
}).catch((err) => {
  console.log(err)
  process.exit(1)
})
