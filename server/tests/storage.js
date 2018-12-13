import lodash from 'lodash' 
import config from 'config'
import { safeQuery } from '../neo4j/connection'
import Storage from '../storage'
import util from '../lib/util'
import Dataset from '../domain/models/dataset'
import Base from '../domain/models/base'

import * as ObjectStorage from '../storage/object'
import * as LegacyStorage from '../storage/legacy'

global.safeQuery = safeQuery
global.config = config
global.Storage = Storage
global.util = util
global.neo4j = require('neo4j-driver').v1
global.lodash = lodash
global.Dataset = Dataset
global.Base = Base

// Regular filesystem
let inStream = LegacyStorage.createReadStream('datasets', 'devices-in.csv')
let outStream = LegacyStorage.createWriteStream('datasets', 'devices-out.csv')

inStream.pipe(outStream)

inStream.on('end', () => console.log('Finished reading from legacy'))
outStream.on('finish', () => console.log('Finished writing to legacy'))

// To OpenStack Swift
inStream = LegacyStorage.createReadStream('datasets', 'devices-in.csv')
outStream = ObjectStorage.createWriteStream('datasets', 'devices-out.csv')

inStream.pipe(outStream)

inStream.on('end', () => console.log('Finished reading from legacy'))
outStream.on('finish', () => console.log('Finished writing to object storage'))