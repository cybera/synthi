import redis from 'redis'
import asyncRedis from 'async-redis'

export const NonAsyncRedisClient = redis.createClient({ host: 'redis' })

// Apparently decorating does change some things about the object it's decorating,
// so we actually need to create two clients if we want to be able to still use
// redis for our sessions but also for other things. Oh well.
const AsyncRedisClient = asyncRedis.createClient({ host: 'redis' })

export default AsyncRedisClient
