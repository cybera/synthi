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

const createWriteStream = relativePath => connection().upload({
  container: config.get('storage.object.uploadContainer'),
  remote: relativePath
})

const createReadStream = relativePath => connection().download({
  container: config.get('storage.object.uploadContainer'),
  remote: relativePath
})

const exists = (relativePath) => {
  return new Promise((resolve, reject) => {
    connection().getFile(
      config.get('storage.object.uploadContainer'),
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
