import { Types } from 'mongoose'
import service from './service'
import ControllerBase from '../../utils/controllerBase'

export default new (class Controller extends ControllerBase {
  async cancelTrip(
    passenger: any,
    tripId: Types.ObjectId,
    reasonId: Types.ObjectId | null,
    reason: String | null
  ) {
    const canceledTrips: any = await service.findByPassengerId(passenger.userId)
    if (!canceledTrips) {
      const canceledTrip = await service.save({
        passenger: passenger.userId,
        trips: [
          {
            tripId,
            reasonId: reasonId || null,
            reason: reason || null
          }
        ]
      })
      return canceledTrip
    }
    canceledTrips.trips.push({
      tripId,
      reasonId: reasonId || null,
      reason: reason || null
    })
    await canceledTrips.save()
    return canceledTrips
  }
})(service)
