import pkgcloud from 'pkgcloud'
import config from 'config'

import logger from '../config/winston'

let openstack

const connection = () => {
  if (!openstack) {
    const openstackCreds = config.get('storage.object.creds')
    openstack = pkgcloud.storage.createClient(openstackCreds)
  }

  return openstack
}

const testConnection = async () => {
  const containers = config.get('storage.object.containers')
  const promises = []

  Object.keys(containers).forEach((key) => {
    promises.push(new Promise((resolve, reject) => {
      connection().getFiles(containers[key], (err, file) => {
        if (err) {
          reject(err)
        } else {
          resolve(file)
        }
      })
    }))
  })

  return Promise.all(promises)
}

const createWriteStream = (area, relativePath) => connection().upload({
  container: config.get('storage.object.containers')[area],
  remote: relativePath
})

const createReadStream = (area, relativePath) => connection().download({
  container: config.get('storage.object.containers')[area],
  remote: relativePath
})

const remove = (area, relativePath) => connection().removeFile(
  config.get('storage.object.containers')[area],
  relativePath,
  (err) => logger.error(err)
)

const exists = async (area, relativePath) => {
  return new Promise((resolve, reject) => {
    connection().getFile(
      config.get('storage.object.containers')[area],
      relativePath,
      (err, file) => {
        // !err means the object exists
        resolve(!err)
      }
    )
  })
}

// Object storage won't have the file in the first place if there was a failure
const cleanupOnError = (area, relativePath) => logger.info(`Object storage cleanup: ${area}:${relativePath} (doing nothing)`)

export {
  testConnection,
  createWriteStream,
  createReadStream,
  remove,
  cleanupOnError,
  exists,
  connection
}
