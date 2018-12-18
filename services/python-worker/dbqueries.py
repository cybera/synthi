def valid_org_names(tx, user_uuid):
  results = tx.run('''
    MATCH (u:User { uuid: $uuid })-[:MEMBER]->(o:Organization)
    RETURN o.name AS name
  ''', uuid=user_uuid)
  return [r['name'] for r in results]