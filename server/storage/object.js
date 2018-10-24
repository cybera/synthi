import pkgcloud from 'pkgcloud'

import config from 'config'

let openstack

const connection = () => {
  if (!openstack) {
    const openstackCreds = config.get('storage.object.creds')
    openstack = pkgcloud.storage.createClient(openstackCreds)
  }

  return openstack
}

const createWriteStream = (area, relativePath) => connection().upload({
  container: config.get('storage.object.containers')[area],
  remote: relativePath
})

const createReadStream = (area, relativePath) => connection().download({
  container: config.get('storage.object.containers')[area],
  remote: relativePath
})

const exists = (area, relativePath) => {
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

export {
  createWriteStream,
  createReadStream,
  exists,
  connection
}
