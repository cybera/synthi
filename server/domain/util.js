/*
  For bits of domain level logic that we're using in multiple
  places.
*/

import { safeQuery } from '../neo4j/connection'

export async function memberOfOwnerOrg(user, ownedObject) {
  const owner = await ownedObject.owner()
  const orgs = await user.orgs()
  const match = orgs.find(org => org.uuid === owner.uuid)
  return typeof match !== 'undefined'
}

export async function canTransform(user, datasetUuids) {
  const unownedDatasetsQuery = `
    MATCH (u:User { uuid: $user.uuid } )-[:MEMBER]->(:Organization)-[:OWNER]->(d:Dataset)
    WHERE d.uuid IN $datasetUuids
    WITH COLLECT(d.uuid) AS ownedUuids
    RETURN [uuid IN $datasetUuids WHERE NOT uuid IN ownedUuids] AS unownedUuids
  `
  const results = await safeQuery(unownedDatasetsQuery, { user, datasetUuids })

  return results[0].unownedUuids.length === 0
}
