import { safeQuery } from '../neo4j/connection'

module.exports.load = async (fn) => {
  let store

  try {
    const results = await safeQuery('MATCH (n:Migrations) RETURN n')
    if (!results[0]) return fn(null, {})
    store = JSON.parse(results[0].properties.store)
  } catch (err) {
    return fn(err)
  }

  return fn(null, store)
}

module.exports.save = async (set, fn) => {
  const store = JSON.stringify({
    lastRun: set.lastRun,
    migrations: set.migrations
  })

  await safeQuery(['MERGE (n:Migrations { store: $store })', { store }])
  fn()
}
