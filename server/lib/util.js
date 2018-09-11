import path from 'path'
import { exec } from 'child_process'
import fs from 'fs'

const runTransformation = (datasetID) => {
  const transform_script = path.resolve(__dirname, '..', 'scripts', 'engine.py')
  const transform_cmd = [transform_script, datasetID].join(" ")
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
    runTransformation(dataset.id)
  }
}

export { runTransformation, datasetExists, ensureDatasetExists }