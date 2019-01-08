import shortid from 'shortid'

import { fullScriptPath } from '../../lib/util'
import Storage from '../../storage'
import Base from './base'
import logger from '../../config/winston'

class Transformation extends Base {
  constructor(node) {
    super(node)
    if (!this.script) {
      const id = shortid.generate()
      const uniqueFilename = `${id}-${this.name}.py`.replace(/ /g, '_')

      this.script = uniqueFilename
    }
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
      logger.error(err)
    }

    return null
  }

  storeCode(code) {
    try {
      const writeStream = Storage.createWriteStream('scripts', this.script)
      writeStream.write(code, 'utf8')
      writeStream.end()
    } catch (err) {
      logger.error(err)
    }
  }

  async canAccess(user) {
    logger.warn('Implement ME!')
    return true
  }
}

Transformation.label = 'Transformation'
Transformation.saveProperties = ['script', 'name']

export default Transformation
