// Create sample dataset nodes

CREATE (weather:Dataset { name: 'weather' })
CREATE (crime:Dataset { name: 'crime' })
CREATE (demographics:Dataset { name: 'demographics' })

MERGE (weather)<-[:BELONGS_TO]-(:Column { name: 'date' })
MERGE (weather)<-[:BELONGS_TO]-(:Column { name: 'temp' })
MERGE (weather)<-[:BELONGS_TO]-(:Column { name: 'postal_code' })