import lodash from 'lodash' 
import config from 'config'
import { safeQuery } from './neo4j/connection'
import Storage from './storage'
import util from './lib/util'
import Dataset from './domain/models/dataset'
import Base from './domain/models/base'


global.safeQuery = safeQuery
global.config = config
global.Storage = Storage
global.util = util
global.neo4j = require('neo4j-driver').v1
global.lodash = lodash
global.Dataset = Dataset
global.Base = Base

require('repl').start({})
