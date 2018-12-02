import shortid from 'shortid'

import DatasetRepository from '../repositories/datasetRepository'
import { fullScriptPath } from '../../lib/util'
import Storage from '../../storage'
import Base from './base'

class Transformation extends Base {
  constructor(node) {
    super(node)
    if (!this.script) {
      const id = shortid.generate()
      const uniqueFilename = `${id}-${this.name}.py`.replace(/ /g, '_')

      this.script = uniqueFilename
    }


    // if (neo4jNode) {
    //   const { inputs, outputs, ...rest } = neo4jNode.properties

    //   Object.assign(this, rest)

    //   this.id = neo4jNode.identity
    //   this.inputs = inputs.map(inputName => DatasetRepository.getByName(context, inputName))
    //   this.outputs = outputs.map(outputName => DatasetRepository.getByName(context, outputName))

    //   if (!this.name) {
    //     [this.name] = this.outputs
    //   }

    //   if (!this.script) {
    //     const id = shortid.generate()
    //     const uniqueFilename = `${id}-${this.name}.py`.replace(/ /g, '_')

    //     this.script = uniqueFilename
    //   }
    // }
  }

  fullPath() {
    return fullScriptPath(this.script)
  }

  async code() {
    try {
      if (this.script && Storage.exists('scripts', this.script)) {
        const fileString = await Storage.read('scripts', this.script)
        return fileString
      }
    } catch (err) {
      console.log(err)
    }

    return null
  }

  storeCode(code) {
    try {
      const writeStream = Storage.createWriteStream('scripts', this.script)
      writeStream.write(code, 'utf8')
      writeStream.end()
    } catch (err) {
      console.log(err)
    }
  }
}

Transformation.label = 'Transformation'
Transformation.saveProperties = ['script', 'name']

export default Transformation
