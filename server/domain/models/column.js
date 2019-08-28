import Base from './base'
import RedisClient from '../../lib/redisClient'

class Column extends Base {
  async visibleForUser(user) {
    const key = this.__cacheKeyForUser(user)
    const cacheVisible = await RedisClient.hget(key, 'visible')
    // Annoyingly, redis stores our true/false values as strings
    return cacheVisible ? cacheVisible === 'true' : this.order < 5
  }

  async setVisibleForUser(visible, user) {
    const key = `user:${user.uuid}:column:${this.uuid}`
    await RedisClient.hset(key, 'visible', visible)
    return visible
  }

  __cacheKeyForUser(user) {
    return `user:${user.uuid}:column:${this.uuid}`
  }
}

Column.label = 'Column'
Column.saveProperties = ['name', 'order']

Base.ModelFactory.register(Column)

export default Column
