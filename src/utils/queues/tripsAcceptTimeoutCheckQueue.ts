import Queue from 'bull'
import { UPDATE_TRIP } from '../pubsubKeys'
import pubsub from '../pubsub'
import tripService from '../../schema/trip/service'
import orderController from '../../schema/order/controller'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../../config'

const tripsAcceptTimeoutCheck = new Queue('tripsAcceptTimeoutCheck', {
  redis: {
    port: REDIS_PORT,
    host: REDIS_HOST,
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {})
  }
})

tripsAcceptTimeoutCheck.process(async ({ data }) => {
  const { trip } = data

  const targetTrip = await tripService.findOneAndUpdate(
    {
      ended: false,
      state: 'SEARCHING',
      _id: trip._id
    },
    {
      ended: true
    }
  )

  if (targetTrip) {
    if (targetTrip.shopOrder) {
      orderController.changeStatusToNotAccepted(targetTrip.shopOrder)
    }

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: targetTrip
    })
  }
})

export default tripsAcceptTimeoutCheck
