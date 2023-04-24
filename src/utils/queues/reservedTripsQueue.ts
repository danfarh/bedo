import Queue from 'bull'
import moment from 'moment-timezone'
import tripService from '../../schema/trip/service'
import {
  createNotificationAndSendToDriver,
  createNotificationAndSendToUser
} from '../createNotificationAndSend'
import carService from '../../schema/car/service'
import { UPDATE_TRIP } from '../pubsubKeys'
import pubsub from '../pubsub'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../../config'

const reservedTripsQueue = new Queue('reservedTripsQueue', {
  redis: {
    port: REDIS_PORT,
    host: REDIS_HOST,
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {})
  }
})

reservedTripsQueue.process(async ({ data }) => {
  const { driver, trip } = data

  const tripExists: any = await tripService.findOneAndUpdate(
    { _id: trip._id, ended: false },
    {
      state: 'ACCEPTED'
    }
  )

  if (tripExists) {
    await carService.changeIsInTrip(driver.defaultCar, true)

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: trip
    })
    if (!tripExists.isForShopDelivery) {
      createNotificationAndSendToUser(
        trip.passenger,
        'IMPORTANT',
        'scheduled trip',
        `your trip created at ${moment(trip.createdAt)
          .tz('America/Toronto')
          .format('D MMM hh:mm z')} is started , your driver is on the way`
      )
      createNotificationAndSendToDriver(
        trip.driver,
        'IMPORTANT',
        'scheduled trip',
        `your trip accepted at ${moment(trip.startDate)
          .tz('America/Toronto')
          .format('D MMM hh:mm z')} is started , open your app and drive to passenger location`
      )
    }
    if (tripExists.isForShopDelivery) {
      createNotificationAndSendToUser(
        trip.passenger,
        'IMPORTANT',
        'order delivery',
        'your package is on the way'
      )
    }
  }
})

export default reservedTripsQueue
