import { safeQuery } from '../neo4j/connection'

if (process.argv.length !== 4) {
  console.log('Usage: add-user-to-org USERNAME ORGANIZATION')
  process.exit(1)
}

const username = process.argv[2]
const org = process.argv[3]

console.log(`Adding ${username} to ${org}`)

safeQuery(`MATCH (o:Organization { name: $org }), (u:User { username: $username })
          CREATE (u)-[:MEMBER]->(o)`, { username, org })
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
