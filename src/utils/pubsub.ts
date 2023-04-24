import { RedisPubSub } from 'graphql-redis-subscriptions'
import { withFilter } from 'apollo-server-express'
import { subClient, client } from './redis'

const pubsub = new RedisPubSub({
  publisher: client,
  subscriber: subClient
})

export default pubsub
export { withFilter }
