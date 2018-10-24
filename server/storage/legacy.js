import fs from 'fs'
import pathlib from 'path'
import mkdirp from 'mkdirp'

const ensureFoldersExist = () => {
  const dataDir = pathlib.resolve(process.env.DATA_FOLDER)

  // Ensure upload directories exist
  mkdirp.sync(pathlib.join(dataDir, 'scripts'))
  mkdirp.sync(pathlib.join(dataDir, 'datasets'))
}

const fullPath = (area, relativePath) => {
  const dataDir = pathlib.resolve(process.env.DATA_FOLDER)
  return pathlib.join(dataDir, area, relativePath || '')
}

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

export { createWriteStream, createReadStream, exists }
