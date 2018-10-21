import config from 'config'
import { compact } from 'lodash'

const checkConfig = () => {
  const entriesToCheck = [
    // openstack
    'storage.object.creds.provider',
    'storage.object.creds.username',
    'storage.object.creds.password',
    'storage.object.creds.region',
    'storage.object.creds.tenantName',
    'storage.object.creds.authUrl',
    // neo4j
    'neo4j.username',
    'neo4j.password'
  ]

  const notDefined = compact(
    entriesToCheck.map(entry => (
      config.has(entry) ? null : entry
    ))
  )

  if (notDefined.length > 0) {
    console.error('Required configuration entries aren\'t defined:\n')
    notDefined.forEach(entry => console.error(`* ${entry} not defined`))
  }
}

export { checkConfig }
