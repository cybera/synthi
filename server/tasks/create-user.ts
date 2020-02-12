import bcrypt = require('bcrypt')

import { safeQuery } from '../neo4j/connection'

async function createUser(): Promise<void> {
  if (process.argv.length < 4) {
    console.log('Usage: create-user USERNAME PASSWORD <APIKEY>')
    process.exit(1)
  }

  const username = process.argv[2]
  const password = process.argv[3]
  let apikey = null

  if (process.argv.length > 4) {
    apikey = process.argv[4]
  }

  const hashedPassword = await bcrypt.hash(password, 8)

  console.log(`Created password hash: ${hashedPassword}`)
  console.log(`Creating user: ${username}`)

  await safeQuery('CREATE (:Organization { name: $username })<-[:MEMBER]-(:User { username: $username, password: $password })',
    { username, password: hashedPassword })

  if (apikey) {
    await safeQuery('MATCH (u:User { username: $username }) SET u.apikey = $apikey',
      { username, apikey })
  }
}

createUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
