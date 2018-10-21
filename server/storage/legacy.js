import fs from 'fs'
import pathlib from 'path'

const fullPath = (relPath) => {
  const uploadDir = pathlib.resolve(process.env.UPLOADS_FOLDER)
  return pathlib.join(uploadDir, relPath || '')
}

const createWriteStream = (relativePath) => {
  const path = fullPath(relativePath)
  return fs.createWriteStream(path)
}

const createReadStream = (relativePath) => {
  const path = fullPath(relativePath)
  return fs.createReadStream(path)
}

// TODO: The fs API actually suggests not to check for existence first and
// simply deal with the error
const exists = async (relativePath) => {
  return new Promise((resolve, reject) => {
    const path = fullPath(relativePath)
    if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

export { createWriteStream, createReadStream, exists }
