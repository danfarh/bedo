import Queue from 'bull'
import tripService from '../../schema/trip/service'
import {
  createNotificationAndSendToDriver,
  createNotificationAndSendToUser
} from '../createNotificationAndSend'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../../config'

const reservedTripsNotificationQueue = new Queue('reservedTripsNotificationQueue', {
  redis: {
    port: REDIS_PORT,
    host: REDIS_HOST,
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {})
  }
})

reservedTripsNotificationQueue.process(async ({ data }) => {
  const { trip } = data
  const tripExists = await tripService.findOne({ _id: trip._id, ended: false })
  if (tripExists) {
    createNotificationAndSendToUser(
      trip.passenger,
      'IMPORTANT',
      'scheduled trip',
      'your scheduled trip starts in half an hour , get ready'
    )
    createNotificationAndSendToDriver(
      trip.driver,
      'IMPORTANT',
      'scheduled trip',
      'your scheduled trip starts in half an hour , don`t start any new trip'
    )
  }
})

export default reservedTripsNotificationQueue
