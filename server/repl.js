import lodash from 'lodash' 
import config from 'config'
import { safeQuery } from './neo4j/connection'
import Storage from './storage'
import * as Util from './lib/util'
import Dataset from './domain/models/dataset'
import Base from './domain/models/base'
import Organization from './domain/models/organization'
import { datasetStorageMap } from './domain/models/transformation'
import * as ModelFactory from './domain/models/modelFactory'
import DatasetCSV from './domain/models/datasetCSV'
import Task, { TransformTask } from './domain/models/task'
import DefaultQueue from './lib/queue'

global.safeQuery = safeQuery
global.config = config
global.Storage = Storage
global.Util = Util
global.neo4j = require('neo4j-driver').v1
global.lodash = lodash
global.Dataset = Dataset
global.Organization = Organization
global.Base = Base
global.datasetStorageMap = datasetStorageMap
global.ModelFactory = ModelFactory
global.DatasetCSV = DatasetCSV
global.Task = Task
global.TransformTask = TransformTask
global.DefaultQueue = DefaultQueue

require('repl').start({})
