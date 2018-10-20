import config from 'config'
import { safeQuery } from './neo4j/connection'
import Storage from './storage'
import util from './lib/util'

global.safeQuery = safeQuery
global.config = config
global.Storage = Storage
global.util = util

require('repl').start({})
