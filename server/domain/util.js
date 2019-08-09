/*
  For bits of domain level logic that we're using in multiple
  places.
*/

// eslint-disable-next-line import/prefer-default-export
export async function memberOfOwnerOrg(user, ownedObject) {
  const owner = await ownedObject.owner()
  const orgs = await user.orgs()
  const match = orgs.find(org => org.uuid === owner.uuid)
  return typeof match !== 'undefined'
}
