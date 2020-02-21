import { safeQuery } from '../neo4j/connection'

if (process.argv.length !== 3) {
  console.log('Usage: create-org NAME')
  process.exit(1)
}

const name = process.argv[2]

console.log(`Creating org: ${name}`)

safeQuery('CREATE (:Organization { name: $name })', { name })
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
