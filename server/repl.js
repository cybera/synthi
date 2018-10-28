import lodash from 'lodash' 
import config from 'config'
import { safeQuery } from './neo4j/connection'
import Storage from './storage'
import util from './lib/util'

global.safeQuery = safeQuery
global.config = config
global.Storage = Storage
global.util = util
global.neo4j = require('neo4j-driver').v1
global.lodash = lodash

require('repl').start({})
