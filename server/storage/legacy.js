import fs from 'fs'
import pathlib from 'path'
import mkdirp from 'mkdirp'
import config from 'config'

const ensureFoldersExist = () => {
  const dataDir = pathlib.resolve(config.get('storage.legacy.dataRoot'))

  // Ensure upload directories exist
  mkdirp.sync(pathlib.join(dataDir, 'scripts'))
  mkdirp.sync(pathlib.join(dataDir, 'datasets'))
}

const fullPath = (area, relativePath) => {
  const dataDir = pathlib.resolve(config.get('storage.legacy.dataRoot'))
  return pathlib.join(dataDir, area, relativePath || '')
}

const testConnection = () => {}

const createWriteStream = (area, relativePath) => {
  ensureFoldersExist()
  const path = fullPath(area, relativePath)
  return fs.createWriteStream(path)
}

const createReadStream = (area, relativePath) => {
  ensureFoldersExist()
  const path = fullPath(area, relativePath)
  return fs.createReadStream(path)
}

const remove = (area, relativePath) => {
  const path = fullPath(area, relativePath)
  if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
    fs.unlinkSync(path)
  }
}

// TODO: The fs API actually suggests not to check for existence first and
// simply deal with the error
const exists = async (area, relativePath) => {
  return new Promise((resolve, reject) => {
    const path = fullPath(area, relativePath)
    if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

// Object storage won't have the file in the first place if there was a failure
const cleanupOnError = (area, relativePath) => remove(area, relativePath)

export {
  testConnection,
  createWriteStream,
  createReadStream,
  remove,
  cleanupOnError,
  exists
}