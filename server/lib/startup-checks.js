import config from 'config'
import { compact } from 'lodash'

import Storage from '../storage'
import logger from '../config/winston'

const checkConfig = async () => {
  let passed = true

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
    'neo4j.password',
    // server
    'server.secret'
  ]

  const notDefined = compact(
    entriesToCheck.map(entry => (
      config.has(entry) ? null : entry
    ))
  )

  if (notDefined.length > 0) {
    passed = false
    logger.error('Required configuration entries aren\'t defined:')
    notDefined.forEach(entry => logger.error(`* ${entry} not defined`))
  }

  try {
    await Storage.testConnection()
  } catch (err) {
    passed = false
    logger.error(`Storage connection test failed: ${err}`)
    logger.error('* Confirm that your credentials and container names are correct')
  }

  return passed
}

export { checkConfig }
