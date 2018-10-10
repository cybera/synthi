import fs from 'fs'
import shortid from 'shortid'

import DatasetRepository from '../../domain/repositories/datasetRepository'
import { fullScriptPath } from '../../lib/util'

export default class Transformation {
  constructor(neo4jNode, context) {
    if (neo4jNode) {
      const { inputs, outputs, ...rest } = neo4jNode.properties

      Object.assign(this, rest)

      const context = { user: { id: this.owner_id } }

      this.id = neo4jNode.identity
      this.inputs = inputs.map(input_name => DatasetRepository.getByName(context, input_name))
      this.outputs = outputs.map(output_name => DatasetRepository.getByName(context, output_name))

      if (!this.name) {
        this.name = this.outputs[0]
      }

      if (!this.script) {
        const id = shortid.generate()
        const uniqueFilename = `${id}-${this.name}.py`.replace(/ /g, '_')

        this.script = uniqueFilename
      }
    }
  }

  fullPath() {
    console.log("script:")
    console.log(this.script)
    return fullScriptPath(this.script)
  }
  
  code() {
    const path = this.fullPath()

    try {
      if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
        const fileString = fs.readFileSync(path, 'utf8')
        return fileString
      }
    } catch(err) {
      console.log(err)
    }

    return null
  }

  storeCode(code) {
    const path = this.fullPath()

    try {
      let writeStream = fs.createWriteStream(path)
      writeStream.write(code, 'utf8')
      writeStream.on('finish', () =>{
        console.log(`wrote code to: ${path}`)
      })
      writeStream.end()
    } catch(err) {
      console.log(err)
    }
  }
}