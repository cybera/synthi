import path from 'path'
import { exec } from 'child_process'
import fs from 'fs'
import waitOn from 'wait-on'

const runTransformation = (dataset) => {
  if(dataset.path && fs.exists(dataset.path)) {
    fs.unlink(dataset.path)
  }
  const transform_script = path.resolve(__dirname, '..', 'scripts', 'engine.py')
  const transform_cmd = [transform_script, dataset.id].join(" ")
  exec(transform_cmd, (error, stdout, stderr) => {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  })
}

const datasetExists = (dataset) => {
  return (dataset.path && fs.existsSync(dataset.path))
}

const ensureDatasetExists = (dataset) => {
  if(!datasetExists(dataset) && dataset.computed) {
    runTransformation(dataset)
  }
}

const waitForFile = (path) => {
  return new Promise((resolve, reject) => {
    // TODO: This will need to change when using non-local storage
    waitOn({ 
      resources: [`file:${path}`],
      interval: 1000,
      timeout: 60000
    }, err => err ? reject(err) : resolve() )
  })
}

export { runTransformation, datasetExists, ensureDatasetExists, waitForFile }