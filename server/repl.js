import lodash from 'lodash' 
import config from 'config'
import { safeQuery } from './neo4j/connection'
import Storage from './storage'
import * as Util from './lib/util'
import Base from './domain/models/base'
import { datasetStorageMap } from './domain/models/transformation'
import * as ModelFactory from './domain/models/modelFactory'
import DefaultQueue from './lib/queue'
import * as Models from './domain/models'

global.safeQuery = safeQuery
global.config = config
global.Storage = Storage
global.Util = Util
global.neo4j = require('neo4j-driver').v1
global.lodash = lodash

// Make all model classes accessible in the global scope
Object.assign(global, Models)

global.Base = Base
global.datasetStorageMap = datasetStorageMap
global.ModelFactory = ModelFactory
global.DefaultQueue = DefaultQueue

require('repl').start({})
