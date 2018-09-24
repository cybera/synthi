import { PubSub, withFilter } from 'apollo-server-express'

const pubsub = new PubSub();

export { pubsub, withFilter }